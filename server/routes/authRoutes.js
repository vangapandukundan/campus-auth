const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Register new user (no password needed)
router.post('/register', ctrl.register);

// WebAuthn biometric routes
router.post('/webauthn/register/start',  protect,      ctrl.webAuthnRegisterStart);
router.post('/webauthn/register/finish', protect,      ctrl.webAuthnRegisterFinish);
router.post('/webauthn/login/start',     authLimiter,  ctrl.webAuthnLoginStart);
router.post('/webauthn/login/finish',    authLimiter,  ctrl.webAuthnLoginFinish);

// TOTP (Google Authenticator) routes
router.post('/totp/setup',  protect,     ctrl.totpSetup);
router.post('/totp/verify', authLimiter, ctrl.totpVerify);

// Push notification routes
router.post('/push/send',   authLimiter, ctrl.pushSend);
router.post('/push/verify', authLimiter, ctrl.pushVerify);

// Face Recognition routes ← NEW
router.post('/face/enroll/start',   protect,      ctrl.faceEnrollStart);
router.post('/face/enroll/finish',  protect,      ctrl.faceEnrollFinish);
router.post('/face/login/start',    authLimiter,  ctrl.faceLoginStart);
router.post('/face/login/finish',   authLimiter,  ctrl.faceLoginFinish);
router.get('/face/status',          protect,      ctrl.faceStatus);

// Get current logged-in user
router.get('/me', protect, ctrl.getMe);

module.exports = router;