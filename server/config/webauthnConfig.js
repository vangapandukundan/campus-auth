const isProd = process.env.NODE_ENV === 'production';

// In production, fall back to the real Vercel domain even if CLIENT_URL is not set
const clientUrl = process.env.CLIENT_URL
  || (isProd ? 'https://campus-auth.vercel.app' : 'http://localhost:3000');

// rpID must exactly match the hostname of the page running the WebAuthn ceremony
//   localhost:3000              → 'localhost'
//   https://campus-auth.vercel.app → 'campus-auth.vercel.app'
const rpID = process.env.RP_ID || new URL(clientUrl).hostname;

const config = {
  rpName:       process.env.RP_NAME || 'CampusAuth',
  rpID,
  origin:       clientUrl,
  challengeTTL: 5 * 60 * 1000, // 5 minutes
};

module.exports = config;