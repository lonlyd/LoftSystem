const db = require('../models');
const helper = require('../helpers/serialize');
const secret = require('../auth/config.json');
const tokens = require('../auth/tokens.js');

module.exports.get = async function (req, res, next) {
  try {
    const news = await db.getNews();
    return res.json(news);
  } catch (e) {
    next(e);
  }
}

module.exports.post = async function (req, res, next) {
  try {
    const token = req.headers['authorization'];
    const user = await tokens.getUserByToken(token, db, secret.secret);
    await db.createNews(req.body, helper.serializeUser(user));
    const news = await db.getNews();
    res.json(news);
  } catch (e) {
    next(e);
  }
}

module.exports.patch = async function (req, res, next) {
  try {
    await db.updateNews(req.params.id, req.body);
    const news = await db.getNews();
    res.json(news);
  } catch (e) {
    next(e);
  }
}

module.exports.delete = async function (req, res, next) {
  try {
    await db.deleteNews(req.params.id);
    const news = await db.getNews();
    res.json(news);
  } catch (e) {
    next(e);
  }
}