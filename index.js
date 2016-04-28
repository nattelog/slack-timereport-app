/**
 * Slack interface for Trax.
 *
 * MIT Licence
 */


var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var traxParser = require('./lib/trax-parser');
var trax = require('node-trax');
var config = require('./config');
var app = express();


//app.use(morgan('dev'));
app.use(bodyParser.json('strict'));
app.use(bodyParser.urlencoded({ extended: false }));


/**
 * Slack will sometimes do a GET check which should respond with a 200.
 */
app.get(config.slack.command, function(req, res, next) {
  if (req.query.ssl_check == 1) {
    res.status(200).send({
      message: 'Got it!'
    });
  }
  else {
    next();
  }
});


/**
 * Make sure request has the correct token and command.
 */
app.use(function(req, res, next) {
  if (req.body.token !== config.slack.token) {
    next(new Error('Bad access token'));
  }
  else if (req.body.command !== config.slack.command) {
    next(new Error('Bad command'));
  }
  else {
    next();
  }
});


/**
 * Interpret /track arguments received from Slack.
 */
app.use(traxParser);


/**
 * Initialize Trax with the Google Spreadsheet.
 */
app.use(function(req, res, next) {
  var creds = require('./credentials');
  trax.init(config.spreadsheet.token, creds, next);
});


app.use(function(req, res, next) {
  var err = new Error('Route not found');
  err.status = 404;
  next(err);
});


app.use(function(err, req, res, next) {
  err.status = err.status || 500;
  res.status(err.status);
  res.send({
    status: err.status,
    message: err.message,
    error: err
  });
});


module.exports = app;
