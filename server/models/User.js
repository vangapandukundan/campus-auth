const mongoose = require('mongoose');

// Sub-schema for each registered biometric device
const CredentialSchema = new mongoose.Schema({
  credentialID:        { type: String, required: true },
  credentialPublicKey: { type: String, required: true },
  counter:             { type: Number, default: 0 },     // prevents replay attacks
  deviceType:          { type: String },
  transports:          [String],
  createdAt:           { type: Date, default: Date.now },
  lastUsed:            { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  role:         { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  credentials:  [CredentialSchema],   // biometric credentials array
  totpSecret:   { type: String },     // for Google Authenticator
  fcmToken:     { type: String },     // for push notifications (Firebase)
  challenge:    { type: String },     // temporary WebAuthn challenge
  challengeExp: { type: Date },       // challenge expiry time
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);