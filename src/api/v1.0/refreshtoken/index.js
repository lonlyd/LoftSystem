module.exports.post = async function (req, res) {
  const refreshToken = req.headers['authorization'];
  const data = await tokens.refreshTokens(refreshToken, db, secret.secret);
  res.json({ ...data });
}