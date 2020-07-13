const express = require('express');
const util = require('util');
const bodyParser = require('body-parser');
const utils = require('./utils');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Processing `Content-Type: text/plain` request
app.use(bodyParser.text({ type: 'text/*' }));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.post('/', (req, res) => {
  console.log('req body:', req.body);
  res.json({
    status: "acknowledged"
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(require('http-errors')(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log("error: ", err);

  // render the error page
  res.status(err.status || 500);
  res.send({error :err})
});

module.exports = app;
