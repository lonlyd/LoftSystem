const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const passport = require('passport');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const helper = require('./helpers/serialize');
const db = require('./models');
require ('./models/connection');

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

const connectedUsers = {};
const historyMessage = {};

const addMessage = (senderId, recipientId, data) => {
  if (historyMessage[senderId]) {
    if (historyMessage[senderId][recipientId]) {
      if (historyMessage[senderId][recipientId].length > 10) {
        historyMessage[senderId][recipientId].shift()
      }
      historyMessage[senderId][recipientId].push(data)
    } else {
      historyMessage[senderId][recipientId] = []
      historyMessage[senderId][recipientId].push(data)
    }
  } else {
    historyMessage[senderId] = {}
    historyMessage[senderId][recipientId] = []
    historyMessage[senderId][recipientId].push(data)
  }
}

io.on('connection', function (socket) {
  const socketId = socket.Id;
  socket.on('user:connect', function (data) {
    const user = { ...data, socketId, activeRoom: null };
    connectedUsers[socketId] = user;
    socket.emit('user:list', Object.values(connectedUsers));
    socket.broadcast.emit('user:add', user);
  });
  socket.on('message:add', function (data) {
    ////////////////////
    console.log('message:add');
    console.log(data);
    ////////////////////
    const { senderId, recipientId } = data;
    socket.emit('message:add', data);
    socket.broadcast.to(data.roomId).emit('message:add', data);
    addMessage(senderId, recipientId, data);
    addMessage(recipientId, senderId, data);
  });
  socket.on('message:history', function (data) {
    ///////////
    console.log('message:history')
    console.log(data)
    console.log(historyMessage)
    //////////////
    if (historyMessage[data.userId] && historyMessage[data.userId][data.recipientId]) {
      socket.emit('message:history', historyMessage[data.userId][data.recipientId]);
      console.log(historyMessage[data.userId][data.recipientId]);
    }
  })
  socket.on('disconnect', function (data) {
    delete connectedUsers[socketId];
    socket.broadcast.emit('users:leave', socketId);
  })
})

const permissionPatch = async function (req, res, next) {
  try {
    const user = await db.updateUserPermission(req.params.Id, req.body);
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
router.get('/news', auth, news.get);
router.post('/news', auth, news.post);
router.patch('/news/:id', auth, news.patch);
router.delete('/news/:id', auth, news.delete);
router.get('/users', auth, users.get);
router.patch('/users/:id/permission', auth, permissionPatch);

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