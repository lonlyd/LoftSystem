const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const passport = require('passport');
const helper = require('./helpers/serialize');
const db = require('./models');
require('./models/connection');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const login = require(path.join(__dirname, 'login'));
const news = require(path.join(__dirname, 'news'));
const profile = require(path.join(__dirname, 'profile'));
const refreshtoken = require(path.join(__dirname, 'refreshtoken'));
const registration = require(path.join(__dirname, 'registration'));
const users = require(path.join(__dirname, 'users'));

const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (!user || err) {
      res.status(401).json({
        code: 401,
        message: 'Unauthorized',
      })
    } else {
      next()
    }
  })(req, res, next)
}
require(path.join(__dirname, 'socket'));

const permissionPatch = async function (req, res, next) {
  try {
    const user = await db.updateUserPermission(req.params.id, req.body);
    res.json({
      ...helper.serializeUser(user)
    })
  } catch (e) {
    next(e);
  }
};

router.post('/registration', registration.post);
router.post('/login', login.post);
router.post('/refresh-token', refreshtoken.post);
router.get('/profile', auth, profile.get);
router.patch('/profile', auth, profile.patch);
router.delete('/users/:id', auth, users.delete);
router.get('/users', auth, users.get);
router.patch('/users/:id/permission', auth, permissionPatch);
router.get('/news', auth, news.get);
router.post('/news', auth, news.post);
router.patch('/news/:id', auth, news.patch);
router.delete('/news/:id', auth, news.delete);

//404
app.use(function (req, res, next) {
  let err = new Error('Page not found');
  err.status = 404;
  next(err);
});
//error handler and render the error page
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.render('error', { message: err.message, error: err });
});

module.exports = router;