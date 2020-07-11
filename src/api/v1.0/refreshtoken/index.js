const db = require('../models');
const secret = require('../auth/config.json');
const tokens = require('../auth/tokens.js');

module.exports.post = async function (req, res) {
  const refreshToken = req.headers['authorization'];
  const data = await tokens.refreshTokens(refreshToken, db, secret.secret);
  res.json({ ...data });
}