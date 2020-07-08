module.exports.get = async function (req, res) {
  const users = await db.getUsers();
  res.json(users.map((user) => helper.serializeUser(user)));
};

module.exports.patch = async function (req, res, next) {
  try {
    const user = await db.updateUserPermission(req.params.id, req.body);
    res.json({
      ...helper.serializeUser(user)
    })
  } catch (e) {
    next(e);
  }
}

module.exports.delete = async function (req, res) {
  await db.deleteUser(req.param.id);
  res.status(204).json({});
}