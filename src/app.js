const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
require(path.join('..', 'src', 'api', 'v1.0', 'auth', 'passport.js'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('build'));
app.use('/api', require(path.join(__dirname, 'api', 'v1.0')));

require(path.join('..', 'src', 'api', 'v1.0', 'models', 'connection.js'));

app.listen(PORT, function () {
  console.log('Server start on port: ' + PORT);
});