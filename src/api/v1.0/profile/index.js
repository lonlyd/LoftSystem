const db = require('../models');
const helper = require('../helpers/serialize');
const secret = require('../auth/config.json');
const tokens = require('../auth/tokens.js');
require('../models/connection.js');


const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


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
  console.log(req.body)
  const newProfile = await db.updateUserProfile(user.id, req.body)
  res.json({
    ...helper.serializeUser(newProfile)
  })
}