const config = {
  rpName:       process.env.RP_NAME || 'CampusAuth',
  rpID:         process.env.RP_ID   || 'localhost',
  origin:       process.env.CLIENT_URL || 'http://localhost:3000',
  challengeTTL: 5 * 60 * 1000, // 5 minutes
};

module.exports = config;