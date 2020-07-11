const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('build'));
app.use('/api', require(path.join(__dirname, 'api', 'v1.0')));

// require('./models/connection');

app.listen(PORT, function () {
  console.log('Server start on port: ' + PORT);
});