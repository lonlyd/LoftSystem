module.exports.post = async function (req, res) {
  const { username } = req.body;
  const user = await db.getUserByName(username);
  if (user) {
    return res.status(400).json({});
  }
  try {
    const newUser = await db.createUser(req.body);
    const token = await tokens.createTokens(newUser, secret.secret);
    res.json({
      ...helper.serializeUser(newUser),
      ...token,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}