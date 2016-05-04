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
	test.done();
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


/*exports.testTrackWithDifferentDays = function(test) {
  var t1 = new Date();
  var t2 = new Date();

  t1.setDate(t2.getDate() - 1);

  trax.track(user, t1, t2, null, function(err) {
    test.notStrictEqual(err, null, 'Error should be defined');
    test.equal(err.message, 'Both dates must be on the same day', 'Error message should be this');
    test.done();
  });
};


exports.testTrackStartOfDay = function(test) {
  var t1 = new Date();
  var t2 = new Date();

  t1.setHours(t1.getHours() - 8);
  t2.setHours(t2.getHours() - 6);

  async.series([
    function trackWithTrax(step) {
      trax.track(user, t1, t2, 'Starting off my awesome day!', function(err) {
	test.ifError(err);
	step();
      });
    },

    function checkActualRows(step) {
      sheet.getRows(function(err, rows) {
	test.ifError(err);
	test.equals(rows.length, 1, 'There should be one added row');
	test.done();
      });
    }
  ]);
};


exports.testTrackNextActivityFail = function(test) {
  trax.track(user, 'Doing more cool stuff.', function(err) {
    test.equal(err.message, 'Latest tracked time is more than 4 hours ago', 'Error message should be this');
    test.done();
  });
};


exports.testOneMoreManualTrack = function(test) {
  var t1 = new Date();
  var t2 = new Date();

  t1.setHours(t1.getHours() - 3);
  t2.setHours(t2.getHours() - 1);
  t1.setMinutes(t1.getMinutes() - 15);

  async.series([
    function trackWithTrax(step) {
      trax.track(user, t1, t2, 'Continuing doing more cool stuff!', function(err) {
	test.ifError(err);
	step();
      });
    },

    function checkActualRows(step) {
      sheet.getRows(function(err, rows) {
	test.ifError(err);
	test.equals(rows.length, 2, 'There should be two rows');
	test.done();
      });
    }
  ]);
};


exports.testTrackPreviousDay = function(test) {
  var t1 = new Date();
  var t2 = new Date();

  t1.setDate(t1.getDate() - 1);
  t1.setHours(t1.getHours() - 6);
  t2.setDate(t2.getDate() - 1);
  t2.setHours(t2.getHours() - 4);

  trax.track(user, t1, t2, 'Awesome work!', function(err) {
    test.ifError(err);
    test.done();
  });
};


exports.testTrackNextActivity = function(test) {
  async.series([
    function trackWithTrax(step) {
      trax.track(user, 'Continuing doing awesome stuff!', function(err) {
	test.ifError(err);
	step();
      });
    },

    function checkActualRows(step) {
      sheet.getRows(function(err, rows) {
	test.ifError(err);
	test.equals(rows.length, 4, 'There should now be 4 rows');
	test.done();
      });
    }
  ]);
};


exports.getStatusForBadUser = function(test) {
  trax.status('bad_user', function(err, status) {
    test.notStrictEqual(err, null, 'Error should be defined');
    test.equal(err.message, 'User not found in spreadsheet');
    test.done();
  });
};


exports.testStatus = function(test) {
  trax.status(user, function(err, status) {
    var thisDate = new Date();
    
    test.ifError(err);
    test.equal(status.total.hours, 7, 'There should be 7 hours total');
    test.equal(status.latestDate.getHours(), thisDate.getHours(), 'Latest hour should be this hour');
    test.equal(status.latestDate.getMinutes(), thisDate.getMinutes(), 'Latest minute should be this minute');
    test.equal(status.latestDescription, 'Continuing doing awesome stuff!', 'Latest description shoud be this');
    test.done();
  });
};


exports.testTrackFrom = function(test) {
  var date = new Date();
  
  trax.track(user, date, 'Working', function(err) {
    test.ifError(err);
    test.done();
  });
};


exports.testStatusAgain = function(test) {
  trax.status(user, function(err, status) {
    console.log(status);
    test.done();
  });
};
*/
