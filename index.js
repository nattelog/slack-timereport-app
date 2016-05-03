/**
 * Google Spreadsheet time report interface with Slack.
 *
 * MIT Licence
 */


var express = require('express');
var morgan = require('morgan');
var assert = require('assert');
var bodyParser = require('body-parser');
var tr = require('./lib/tr');
var config = require('./config');
var Slack = require('node-slack');
var slack;
var format = require('dateformat');
var app = express();


/**
 * Turn on morgan in prod mode.
 */
if (process.env.NODE_ENV == 'prod') {
  app.use(morgan('dev'));
}


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


app.use(function(req, res, next) {
  var response_url = req.body.response_url;

  if (!response_url) {
    res.send({
      text: 'Your request is lacking an address where I can respond.'
    });
  }
  else {
    slack = new Slack(response_url);
    next();
  }
});


/**
 * Verify Slack request and interpret the track arguments.
 */
app.post(config.slack.command, function(req, res, next) {
  var token;
  
  if (process.env.NODE_ENV == 'prod') {
    token = config.slack.prod.token;
  }
  else {
    token = config.slack.test.token;
  }

  assert(req.body.token === token, 'YOU SHALL NOT PASS!');
  assert(req.body.command === config.slack.command, 'I don\'t obey commands like that!');
  assert(req.body.text, 'Are you really not going to write something?');
  assert(req.body.user_name, 'I\'m not sure who you are.');

  var text = require('minimist')(req.body.text.split(' '), {
    default: {
      d: 'today',
      f: 'latest',
      t: 'now'
    },
    string: [ 'd', 'f', 't' ]
  });

  req.tr = {
    user: req.body.user_name.toLowerCase(),
    date: text.d,
    from: text.f,
    to: text.t,
    description: text._.join(' ').trim()
  };

  next();
});


/**
* Check for 'help' or command.
*/
app.post(config.slack.command, function(req, res, next) {
  if (req.tr.description == 'help') {
    res.send({
      text: 'Here\'s some help for you.',
      attachments: [
	{
	  color: 'good',
	  fields: [
	    {
	      title: 'Status',
	      value: 'See your latest track and total tracked time with `' + config.slack.command + ' status`.',
	      short: true
	    },
	    {
	      title: 'Track time',
	      value: 'To track time, you can use flags to tell me what time and date you wish to track on and simply just type the description of what you worked with.\n' +
		
	      '\t`-d` - The date of your track. Must be on format YY-MM-DD, DD/MM/YY or simply "*today*" or "*yesterday*". Defaults to "*today*"\n' +
		
	      '\t`-f` - The time you wish to track from. You can just write hours or hours:minutes or "*now*". Defaults to "*now*".\n' +
		
	      '\t`-t` - The time where your tracking ends. Same format as above except instead of "*now*" you can write "*latest*". Defaults to "*latest*".\n' +
		
		'\n_Example 1_\n' +
		'`' + config.slack.command + ' -f 8 -t 10:15 Working with top secret stuff` - This will create a task *today* between 8:00 -> 10:15 with the description "Working with top secret stuff.".\n' +
		
		'\n_Example 2_\n' +
	      '`' + config.slack.command + ' Working more` - This will simply create a task *today* from your *latest* track to *now* with the description "Working more".' +
		
		'\n_Example 3_\n' +
		'`' + config.slack.command + ' -d yesterday -f 10 -t 12 Worked some more` - This will create a task *yesterday* from 10 to 12 with the description "Worked some more".'
	    }
	  ],
	  mrkdwn_in: ['fields']
	}
      ]
    });
  }
  else {
    next();
  }
});


/**
 * Initialize TR with the Google Spreadsheet
 */
app.post(config.slack.command, function(req, res, next) {
  var creds = require('./credentials');
  var token;

  if (process.env.NODE_ENV == 'prod') {
    token = config.spreadsheet.prod.token;
  }
  else {
    token = config.spreadsheet.test.token;
  }
  
  tr.init(token, creds, next);
});


/**
* Check for 'status' command.
*/
app.post(config.slack.command, function(req, res, next) {
  if (req.tr.description == 'status') {
    res.send({text:'Got it, hold on.'});
    
    tr.status(req.tr.user, function(err, status) {
      if (err) {
	next(err);
      }
      else {
	console.log(status);
	var h = status.total.hours;
	var m = status.total.minutes;
	var date = format(status.latestDate, 'yy-mm-dd H:MM');
	var description = status.latestDescription;
	
	slack.send({
	  text: 'Done!',
	  attachments: [
	    {
	      color: 'good',
	      fields: [
		{
		  title: 'Last track',
		  value: date + ', \"' + description + '\".'
		},
		{
		  title: 'Total',
		  value: h + ':' + m,
		  short: true
		}
	      ]
	    }
	  ]
	});
      }
    });
  }
  else {
    next();
  }
});


/**
 * Add track to the spreadsheet.
 */
app.post(config.slack.command, function(req, res, next) {
  var quotes = require('./lib/time-quotes');

  // respond with a wise quote
  res.send({
    text: quotes.getQuote()
  });
  
  tr.track(req.tr.user, req.tr.date, req.tr.from, req.tr.to, req.tr.description, function(err, row) {
    if (err) {
      next(err);
    }
    else {
      // format pretty response
      var start = format(row.start, 'yy-mm-dd H:MM');
      var end = format(row.end, 'H:MM');
      
      slack.send({
	text: 'Done!',
	attachments: [{
	  color: 'good',
	  text: 'I tracked ' + start + ' -> ' + end + ' with "' + row.description + '".'
	}]
      });
    }
  });
});


app.use(function(req, res, next) {
  var err = new Error('Hm, I did not found the route you issued the command on.');
  next(err);
});


app.use(function(err, req, res, next) {
  slack.send({
    text: 'Blastering barnacles!',
    attachments: [
      {
	color: 'danger',
	text: err.message
      }
    ]
  });
});


module.exports = app;
