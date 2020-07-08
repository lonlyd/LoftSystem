module.exports.get = async function (req, res) {
  const token = req.headers['authorization'];
  const user = await tokens.getUserByToken(token, db, secret.secret);
  res.json({
    ...helper.serializeUser(user)
  });
};

module.exports.patch = async function (req, res) {
  const token = req.headers['authorization'];
  const user = await tokens.getUserByToken(token, db, secret.secret);
  res.json({
    ...helper.serializeUser(user)
  });
};