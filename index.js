/**
 * Slack interface for Trax.
 *
 * MIT Licence
 */


var express = require('express');
var morgan = require('morgan');
var assert = require('assert');
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
 * Verify Slack request and interpret the track arguments.
 */
app.post(config.slack.command, function(req, res, next) {
  assert(req.body.token === config.slack.token, 'YOU SHALL NOT PASS!');
  assert(req.body.command === config.slack.command, 'I don\'t obey commands like that!');
  assert(req.body.text, 'Are you really not going to write something?');
  assert(req.body.user_name, 'I\'m not sure who you are.');

  var text = require('minimist')(req.body.text.split(' '), {
    default: {
      d: 'today',
      f: 'latest',
      t: 'now'
    }
  });

  req.trax = {
    user: req.body.user_name.toLowerCase(),
    date: text.d,
    from: text.f,
    to: text.t,
    description: text._.join(' ').trim()
  };

  next();
});


/**
* Check for 'help' command.
*/
app.post(config.slack.command, function(req, res, next) {
  assert(req.trax.description, 'Trax object is not defined');

  if (req.trax.description == 'help') {
    next(new Error('Help is on the way!'));
  }
  else {
    next();
  }
});


/**
 * Initialize Trax with the Google Spreadsheet.
 */
app.post(config.slack.command, function(req, res, next) {
  var creds = require('./credentials');
  trax.init(config.spreadsheet.test, creds, next);
});


/**
 * Add track to the spreadsheet.
 */
app.post(config.slack.command, function(req, res, next) {
  next();
});


app.use(function(req, res, next) {
  var err = new Error('Hm, I did not found the route you issued the command on.');
  next(err);
});


app.use(function(err, req, res, next) {
  res.status(200);
  res.send({
    text: err.message
  });
});


module.exports = app;
