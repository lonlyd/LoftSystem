const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');

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

router.post('/api/registration', registration.post);
router.post('/api/login', login.post);
router.post('/api/refresh-token', refreshtoken.post);
router.get('/api/profile', auth, profile.get);
router.patch('/api/profile', auth, profile.patch);
router.delete('/api/users/:id', auth, users.delete);
router.get('/api/news', auth, news.get);
router.post('api/news', auth, news.post);
router.patch('api/news/:id', auth, news.patch);
router.delete('/api/news/:id', auth, news.delete);
router.get('/api/users', auth, users.get);
// router.patch('/api/users/:id/permission', auth, users.patchpermission);

module.exports = router;