var GoogleSpreadsheet = require('google-spreadsheet');
var util = require('./util');
var async = require('async');
var config = require('../config');
var token = config.spreadsheet.test.token;
var user = config.spreadsheet.test.user;
var creds = require('../credentials.json');
var api = require('nodeunit-httpclient').create({
  port: 3001,
  status: 200
});


var sheet;


function createSlackRequest(text) {
  return {
    token: config.slack.test.token,
    user_name: user,
    command: config.slack.command,
    text: text,
    response_url: 'localhost'
  };
}


exports.testBadRequest = function(test) {
  api.post(test, '/track', {
    data: {
      token: 'bad_token',
      response_url: 'localhost'
    }
  }, function(res) {
    test.equal(res.data.attachments[0].text, 'YOU SHALL NOT PASS!');
    test.done();
  });
};


exports.testBadCommand = function(test) {
  api.post(test, '/track', {
    data: {
      token: config.slack.test.token,
      command: 'bad_command',
      response_url: 'localhost'
    }
  }, function(res) {
    test.equal(res.data.attachments[0].text, 'I don\'t obey commands like that!');
    test.done();
  });
};


exports.testSSLCheck = function(test) {
  api.get(test, '/track?ssl_check=1', {
    status: 200
  }, function(res) {
    test.equal(res.data.message, 'Got it!', 'Response message should be this');
    test.done();
  });
};
