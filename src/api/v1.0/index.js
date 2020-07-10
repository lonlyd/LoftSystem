const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const passport = require('passport');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

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

const addMessage = (senderID, recipientID, data) => {
  if (historyMessage[senderID]) {
    if (historyMessage[senderID][recipientID]) {
      if (historyMessage[senderID][recipientID].length > 10) {
        historyMessage[senderID][recipientID].shift()
      }
      historyMessage[senderID][recipientID].push(data)
    } else {
      historyMessage[senderID][recipientID] = []
      historyMessage[senderID][recipientID].push(data)
    }
  } else {
    historyMessage[senderID] = {}
    historyMessage[senderID][recipientID] = []
    historyMessage[senderID][recipientID].push(data)
  }
}

io.on('connection', function (socket) {
  const socketID = socket.id;
  socket.on('user:connect', function (data) {
    const user = {...data, socketID, activeRoom: null};
    connectedUsers[socketID] = user;
    socket.emit('user:list', Object.values(connectedUsers));
    socket.broadcast.emit('user:add', user);
  });
  socket.on('message:add', function(data) {
    ////////////////////
    console.log('message:add');
    console.log(data);
    ////////////////////
    const { senderID, recipientID } = data;
    socket.emit('message:add', data);
    socket.broadcast.to(data.roomID).emit('message:add', data);
    addMessage(senderID, recipientID, data);
    addMessage(recipientID, senderID, data);
  });
  socket.on('message:history', function (data) {
    ///////////
    console.log('message:history')
    console.log(data)
    console.log(historyMessage)
    //////////////
    if (historyMessage[data.userID] && historyMessage[data.userID][data.recipientID]) {
      socket.emit('message:history', historyMessage[data.userID][data.recipientID]);
      console.log(historyMessage[data.userID][data.recipientID]);
    }
  })
  socket.on('disconnect', function (data) {
    delete connectedUsers[socketID];
    socket.broadcast.emit('users:leave', socketID);
  })
})

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