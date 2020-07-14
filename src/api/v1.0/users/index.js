const db = require('../models');
const helper = require('../helpers/serialize');



module.exports.get = async function (req, res) {
  const users = await db.getUsers();
  res.json(users.map((user) => helper.serializeUser(user)));
};

module.exports.delete = async function (req, res) {
  await db.deleteUser(req.params.id);
  res.status(204).json({});
}