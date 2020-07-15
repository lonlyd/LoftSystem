const express = require('express')
const path = require('path')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = require('socket.io').listen(server)

require(path.join('..', 'src', 'api', 'v1.0', 'models', 'connection.js'));
require(path.join('..', 'src', 'api', 'v1.0', 'auth', 'passport.js'));

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})
app.use(express.static('build'))

app.use('/api', require(path.join(__dirname, 'api', 'v1.0')));

app.use('*', (_req, res) => {
  const file = path.resolve('build', 'index.html')
  res.sendFile(file)
})

app.use((err, _, res, __) => {
  console.log(err.stack)
  res.status(500).json({
    code: 500,
    message: err.message,
  })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, function () {
  console.log('Server start on port: ' + PORT)
})

const connectedUsers = {}
const historyMessage = {}

io.on('connection', (socket) => {
  const socketId = socket.id
  socket.on('users:connect', function (data) {
    const user = { ...data, socketId, activeRoom: null }
    connectedUsers[socketId] = user
    socket.emit('users:list', Object.values(connectedUsers))
    socket.broadcast.emit('users:add', user)
  })
  socket.on('message:add', function (data) {
    const { senderId, recipientId } = data
    socket.emit('message:add', data)
    socket.broadcast.to(data.roomId).emit('message:add', data)
    addMessageToHistory(senderId, recipientId, data)
    addMessageToHistory(recipientId, senderId, data)
  })
  socket.on('message:history', function (data) {
    if (
      historyMessage[data.userId] &&
      historyMessage[data.userId][data.recipientId]
    ) {
      socket.emit(
        'message:history',
        historyMessage[data.userId][data.recipientId],
      )
    }
  })
  socket.on('disconnect', function (data) {
    delete connectedUsers[socketId]
    socket.broadcast.emit('users:leave', socketId)
  })
})

const addMessageToHistory = (senderId, recipientId, data) => {
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
