const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
require(path.join('..', 'src', 'api', 'v1.0', 'auth', 'passport.js'));
require(path.join('..', 'src', 'api', 'v1.0', 'models', 'connection.js'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('build'));
app.use('/api', require(path.join(__dirname, 'api', 'v1.0')));

app.use(function (_, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

app.listen(PORT, function () {
  console.log('Server start on port: ' + PORT);
});

require(path.join('..', 'src', 'api', 'v1.0', 'socket', 'index.js'));