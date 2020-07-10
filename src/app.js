const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('build'));
app.use('/api', require(path.join(__dirname, 'api', 'v1.0')));

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

app.listen(process.env.PORT || PORT, function () {
  console.log('Server start on port: ' + PORT);
  console.log('Environment', process.env.NODE_ENV);
  console.log(`Server running. Use our API on port: ${PORT}`);
});