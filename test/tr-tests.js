var tr = require('../lib/tr');
var util = require('./util');
var async = require('async');
var token = require('../config').spreadsheet.test.token;
var user = require('../config').spreadsheet.test.user;
var creds = require('../credentials.json');


var sheet;


exports.setupDoc = function(test) {
  util.setupGoogleSpreadsheet(token, creds, user, function(_sheet) {
    sheet = _sheet;
    test.done();
  });
};


exports.trackBeforeInit = function(test) {
  test.throws(function() {
    tr.track(null, null, null, null, null, function(err) {

    });
  }, Error, 'Error should be thrown here');
  test.done();
};


exports.initWithBadToken = function(test) {
  tr.init('bad_token', creds, function(err) {
    test.notStrictEqual(err, null, 'There should be an error here');
    test.done();
  });
};


exports.initWithBadCredentials = function(test) {
  tr.init(token, 'bad_credentials', function(err) {
    test.notStrictEqual(err, null, 'There should be an error here');
    test.done();
  });
};


exports.initTR = function(test) {
  tr.init(token, creds, test.done);
};


exports.testConvertBadDates = function(test) {
  var badDates = [
    'todays',
    'todaysss',
    '1992-10-010',
    '934-10',
    '99/100/ab'
  ];

  badDates.forEach(function(date) {
    test.throws(function() {
      tr.convertToDate(date, '8:00');
    }, Error, 'Error should be thrown here');
  });

  test.done();
};


exports.testConvertValidDates = function(test) {
  var validDates = [
    'today',
    'yesterday',
    '2016-04-01',
    '2016-01-1',
    '2016-4-1',
    '01/22/19'
  ];

  validDates.forEach(function(date) {
    test.doesNotThrow(function() {
      tr.convertToDate(date, '8:00');
    }, Error, 'These dates should pass');
  });

  test.done();
};


exports.testConvertBadTimeFormats = function(test) {
  var badTimeFormats = [
    '8;10',
    '8000000',
    '8.10',
    '087:10'
  ];

  badTimeFormats.forEach(function(time) {
    test.throws(function() {
      tr.convertToDate('today', time);
    }, Error, 'Error should be thrown');
  });

  test.done();
};


exports.testConvertValidTimeFormats = function(test) {
  var validTimeFormats = [
    'now',
    '8:00',
    '8',
    '8:9',
    '8:09',
    '08:09',
    '08:08:00',
    '8:0:10'
  ];

  validTimeFormats.forEach(function(time) {
    test.doesNotThrow(function() {
      tr.convertToDate('today', time);
    }, Error, 'No error should be thrown');
  });

  test.done();
};


exports.testTrackWithBadUser = function(test) {
  tr.track('bad_user', null, null, null, null, function(err) {
    test.notStrictEqual(err, null, 'Error should be defined');
    test.done();
  });
};


exports.testTrackFromLatestOnFirstTrack = function(test) {
  tr.track(user, 'today', 'latest', 'now', null, function(err) {
    test.notStrictEqual(err, null, 'Error should be defined');
    console.log(err.message);
    test.done();
  });
};


exports.testTrackWithWorkingParameters = function(test) {
  async.series([
    function track(step) {
      tr.track(user, 'yesterday', '8', '10', 'Working', function(err) {
	test.ifError(err);
	step();
      });
    },

    function check(step) {
      sheet.getRows(function(err, rows) {
	test.ifError(err);
	test.equal(rows.length, 1, 'There should be one row');
	step();
      });
    },

    function statusCheck(step) {
      tr.status(user, function(err, status) {
	test.ifError(err);
	test.equal(status.total.hours, 2, 'There should be a total of 2 hours tracked');
	test.done();
      });
    }
  ]);
};


exports.testTrackFromLatest = function(test) {
  tr.track(user, 'today', 'latest', '11:30', 'Working more', function(err) {
    test.notStrictEqual(err, null, 'Error should be defined');
    test.equal(err.message, 'Because of tight regulations, I can not allow you to track all the way from yesterday.');
    test.done();
  });
};


exports.testTrackToday = function(test) {
  async.series([
    function track(step) {
      tr.track(user, 'today', '8', '9', 'Working even more', function(err) {
	test.ifError(err);
	step();
      });
    },

    function check(step) {
      sheet.getRows(function(err, rows) {
	test.ifError(err);
	test.equal(rows.length, 2, 'There should be two rows');
	test.done();
      });
    }
  ]);
};


exports.testTrackOddMinute = function(test) {
  async.series([
    function track(step) {
      tr.track(user, 'today', '10', '11:11', 'Working odd minutes', function(err) {
	test.ifError(err);
	step();
      });
    },

    function check(step) {
      tr.status(user, function(err, status) {
	test.ifError(err);
	test.equal(status.latestDate.getMinutes(), 15);
	test.done();
      });
    }
  ]);
};


// NOTE! This test does not pass on a monday
exports.testTrackLastWeek = function(test) {
  // create a date that is last week
  var d = new Date();
  var s;

  d.setDate(d.getDate() - 7);
  s = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
  
  async.series([
    function track(step) {
      tr.track(user, s, '8', '10', 'Tracking last week', function(err) {
	test.ifError(err);
	step();
      });
    },

    function check(step) {
      tr.status(user, function(err, status) {
	console.log(status);
	test.ifError(err);
	test.equals(status.weekTotal.hours, 4);
	test.done();
      });
    }
  ]);
};
