const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

// Derive rpID from the frontend URL hostname automatically:
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