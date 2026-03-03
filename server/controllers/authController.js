const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const speakeasy    = require('speakeasy');
const User         = require('../models/User');
const generateToken = require('../utils/generateToken');
const { rpName, rpID, origin } = require('../config/webauthnConfig');

// ── REGISTER (creates account, no password field) ─────────────
exports.register = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'This email is already registered' });

    const user = await User.create({ name, email, role: role || 'student' });
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: { id: user._id, name, email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── WEBAUTHN REGISTER START ────────────────────────────────────
// Generates options that the browser uses to prompt biometric scan
exports.webAuthnRegisterStart = async (req, res) => {
  try {
    const user = req.user;

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID:          user._id.toString(),
      userName:        user.email,
      userDisplayName: user.name,
      attestationType: 'none', // 'none' = no hardware attestation needed (low-cost device friendly)
      excludeCredentials: user.credentials.map(c => ({
        id: c.credentialID, type: 'public-key', transports: c.transports,
      })),
      authenticatorSelection: {
        residentKey:             'preferred',
        userVerification:        'preferred', // works with PIN too if no biometric
        authenticatorAttachment: 'platform',  // uses built-in device sensor
      },
    });

    // Save challenge to DB for verification in next step
    user.challenge    = options.challenge;
    user.challengeExp = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.json(options);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// ── WEBAUTHN REGISTER FINISH ───────────────────────────────────
// Verifies the biometric response and saves credential
exports.webAuthnRegisterFinish = async (req, res) => {
  try {
    const user = req.user;

    if (!user.challenge || new Date() > user.challengeExp)
      return res.status(400).json({ error: 'Challenge expired. Please try again.' });

    const verification = await verifyRegistrationResponse({
      response:          req.body,
      expectedChallenge: user.challenge,
      expectedOrigin:    origin,
      expectedRPID:      rpID,
    });

    if (!verification.verified)
      return res.status(400).json({ error: 'Biometric verification failed' });

    const { credentialID, credentialPublicKey, counter, credentialDeviceType } =
      verification.registrationInfo;

    // Save this device's credential
    user.credentials.push({
      credentialID:        Buffer.from(credentialID).toString('base64url'),
      credentialPublicKey: Buffer.from(credentialPublicKey).toString('base64url'),
      counter,
      deviceType:  credentialDeviceType,
      transports:  req.body.response?.transports ?? [],
    });

    // Clear the used challenge
    user.challenge    = undefined;
    user.challengeExp = undefined;
    await user.save();

    res.json({ verified: true, message: 'Biometric registered successfully!' });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// ── WEBAUTHN LOGIN START ───────────────────────────────────────
exports.webAuthnLoginStart = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });
    if (!user.credentials.length)
      return res.status(400).json({ error: 'No biometric registered. Please register first.' });

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials: user.credentials.map(c => ({
        id: c.credentialID, type: 'public-key', transports: c.transports,
      })),
    });

    user.challenge    = options.challenge;
    user.challengeExp = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.json(options);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// ── WEBAUTHN LOGIN FINISH ──────────────────────────────────────
exports.webAuthnLoginFinish = async (req, res) => {
  try {
    const { email, response } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.challenge || new Date() > user.challengeExp)
      return res.status(400).json({ error: 'Challenge expired' });

    // Find which stored credential matches
    const dbCred = user.credentials.find(c => c.credentialID === response.id);
    if (!dbCred) return res.status(400).json({ error: 'Credential not found' });

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.challenge,
      expectedOrigin:    origin,
      expectedRPID:      rpID,
      authenticator: {
        credentialID:        Buffer.from(dbCred.credentialID, 'base64url'),
        credentialPublicKey: Buffer.from(dbCred.credentialPublicKey, 'base64url'),
        counter:             dbCred.counter,
        transports:          dbCred.transports,
      },
    });

    if (!verification.verified)
      return res.status(401).json({ error: 'Authentication failed' });

    // Update counter — this prevents replay attacks
    dbCred.counter  = verification.authenticationInfo.newCounter;
    dbCred.lastUsed = new Date();
    user.challenge  = undefined;
    await user.save();

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { res.status(401).json({ error: err.message }); }
};

// ── TOTP SETUP ─────────────────────────────────────────────────
// Call this once → gives a QR code → user scans with Google Authenticator
exports.totpSetup = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `CampusAuth:${req.user.email}`,
      length: 20,
    });
    req.user.totpSecret = secret.base32;
    await req.user.save();
    // Send back QR URL — frontend renders it as QR code
    res.json({ secret: secret.base32, otpauthUrl: secret.otpauth_url });
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// ── TOTP VERIFY ────────────────────────────────────────────────
exports.totpVerify = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    if (!user?.totpSecret) return res.status(400).json({ error: 'OTP app not set up for this account' });

    const valid = speakeasy.totp.verify({
      secret:   user.totpSecret,
      encoding: 'base32',
      token,
      window:   1, // allows ±30 second clock drift
    });

    if (!valid) return res.status(401).json({ error: 'Incorrect OTP code' });

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { res.status(401).json({ error: err.message }); }
};

// ── PUSH SEND ──────────────────────────────────────────────────
// Stores code in memory (use Redis in production)
// For demo: demoCode is returned so you can test without Firebase setup
const pushCodes = new Map();

exports.pushSend = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    pushCodes.set(email, { code, exp: Date.now() + 2 * 60 * 1000 }); // 2 min expiry

    // NOTE: In production, send via Firebase using user.fcmToken
    // For demo/hackathon: code is returned directly in response
    console.log(`[DEMO] Push code for ${email}: ${code}`);

    res.json({ sent: true, demoCode: code }); // remove demoCode in production
  } catch (err) { res.status(400).json({ error: err.message }); }
};

// ── PUSH VERIFY ────────────────────────────────────────────────
exports.pushVerify = async (req, res) => {
  try {
    const { email, code } = req.body;
    const stored = pushCodes.get(email);

    if (!stored)           return res.status(401).json({ error: 'No code sent. Request a new one.' });
    if (Date.now() > stored.exp) return res.status(401).json({ error: 'Code expired. Request a new one.' });
    if (stored.code !== code)    return res.status(401).json({ error: 'Incorrect code' });

    pushCodes.delete(email); // one-time use
    const user = await User.findOne({ email });

    res.json({
      token: generateToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { res.status(401).json({ error: err.message }); }
};

// ── GET ME ─────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({
    id:    req.user._id,
    name:  req.user.name,
    email: req.user.email,
    role:  req.user.role,
  });
};