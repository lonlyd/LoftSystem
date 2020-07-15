const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require(path.join('..', 'models', 'connection.js'));

const connectedUsers = {};
const historyMessage = {};


io.on('connection', function (socket) {
    const socketId = socket.id;
    socket.on('user:connect', function (data) {
        const user = { ...data, socketId, activeRoom: null };
        connectedUsers[socketId] = user;
        socket.emit('user:list', Object.values(connectedUsers));
        socket.broadcast.emit('user:add', user);
    });
    socket.on('message:add', function (data) {
        const { senderId, recipientId } = data;
        socket.emit('message:add', data);
        socket.broadcast.to(data.roomId).emit('message:add', data);
        addMessage(senderId, recipientId, data);
        addMessage(recipientId, senderId, data);
    });
    socket.on('message:history', function (data) {
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