/**
 * Time tracking library for Node.js.
 *
 * Written by Natanael Log
 *
 * MIT Licence
 */


var async = require('async');


var doc;
var TRACK_SPLIT_INTERVAL = 2; // max number of hours a track can be before split
var MINUTE_ROUND_MULTIPLE = 5; // the multiple on which to round up the minutes to before tracking


var validDateDashFormats = [
    /^\d{4}[-]\d{1,2}[-]\d{1,2}$/,
    /^\d{2}[-]\d{1,2}[-]\d{1,2}$/
];


var validDateSlashFormats = [
    /^\d{1,2}[\/]\d{1,2}[\/]\d{2}$/,
    /^\d{1,2}[\/]\d{1,2}[\/]\d{4}$/
];


var validTimeFormats = [
    /^\d{1,2}$/,
    /^\d{1,2}[:]\d{1,2}$/,
    /^\d{1,2}[:]\d{1,2}[:]\d{1,2}$/
];


/**
 * Public methods.
 */
exports.init = init;
exports.status = status;
exports.track = track;
exports.convertToDate = convertToDate;
module.exports = exports;


function init(token, credentials, done) {
  var GoogleSpreadSheet = require('google-spreadsheet');

  doc = new GoogleSpreadSheet(token);
  doc.useServiceAccountAuth(credentials, done);
}


function status(user, done) {
  getSheet(user, function(err, sheet, rows) {
    if (err) {
      done(err);
    }
    else {
      try {
	done(null, {
	  total: sumTotalTime(rows),
	  weekTotal: sumTotalTime(getThisWeek(rows)),
	  latestDate: getLatestDate(rows),
	  latestDescription: getLatestDescription(rows)
	});
      }
      catch (er) {
	done(er);
      }
    }
  });
}


function track(user, date, from, to, description, done) {
  user = user;
  date = date || 'today';
  from = from || 'latest';
  to = to || 'now';
  description = description;

  getSheet(user, function(err, sheet, rows) {
    if (err) {
      done(err);
    }
    else {
      try {
	if (from == 'latest') {
	  from = getLatestDate(rows);
	}
	else {
	  from = convertToDate(date, from);
	}
	to = convertToDate(date, to);
	addTrack(sheet, from, to, description, done);
      }
      catch (er) {
	done(er);
      }
    }
  });
}


function getSheet(user, done) {
  doc.getInfo(function(err, info) {
    if (err) {
      done(err);
    }
    else {
      var sheet;

      for (var i = 0; i < info.worksheets.length; ++i) {
	if (info.worksheets[i].title.toLowerCase() == user.toLowerCase()) {
	  sheet = info.worksheets[i];
	}
      }

      if (!sheet) {
	done(new Error('User not found in spreadsheet'));
      }
      else {
	sheet.getRows({}, function(err, rows) {
	  if (err) {
	    done(err);
	  }
	  else {
	    done(null, sheet, rows);
	  }
	});
      }
    }
  });
}


function addTrack(sheet, t1, t2, description, done) {
  var t1Hours = t1.getHours();
  var t1Minutes = t1.getMinutes();
  var t2Hours = t2.getHours();
  var t2Minutes = roundUpToMultiple(t2.getMinutes());
  var year = t1.getFullYear();
  var month = t1.getMonth() + 1; // month index goes from 0-11
  var day = t1.getDate();

  // make sure t1 and t2 are on the same day
  if (t1.getFullYear() != t2.getFullYear() ||
      t1.getMonth() != t2.getMonth() ||
      t1.getDate() != t2.getDate()) {
    done(new Error('Because of tight regulations, I can not allow you to track all the way from yesterday.'));
  }
  // make sure t2 is comes after t1
  else if (t2 <= t1) {
    done(new Error('My creator is working full time on the time vortex, but until then, please try to track from t1 to t2, where t1 < t2.'));
  }
  else {
    async.series([
      function addRow(step) {
	sheet.addRow({
	  Date: '=DATE(' + year + ',' + month + ',' + day + ')',
	  Start: '=TIME(' + t1Hours + ',' + t1Minutes + ',0)',
	  End: '=TIME(' + t2Hours + ',' + t2Minutes + ',0)',
	  Total: '=INDIRECT(ADDRESS(ROW(), COLUMN()-1, 4)) - INDIRECT(ADDRESS(ROW(), COLUMN()-2, 4))',
	  Description: description
	}, step);
      },

      function getRow(step) {
	sheet.getRows({}, function(err, rows) {
	  if (err) {
	    done(err);
	  }
	  else {
	    var row = rows[rows.length - 1];
	    done(null, {
	      start: convertToDate(row.date, row.start),
	      end: convertToDate(row.date, row.end),
	      description: description,
	    });
	  }
	});
      }
    ]);
  }
}


function roundUpToMultiple(minute) {
  return Math.ceil(minute / MINUTE_ROUND_MULTIPLE) * MINUTE_ROUND_MULTIPLE;
}


function getThisWeek(rows) {
  var today = new Date();
  var monday = new Date();
  var daysToMonday;
  var result = [];

  if (today.getDay() === 0) {
    daysToMonday = 6;
  }
  else {
    daysToMonday = today.getDay() - 1;
  }

  monday.setDate(today.getDate() - daysToMonday);

  rows.forEach(function(row) {
    var date = convertToDate(row.date, row.start);

    if (date >= monday && date <= today) {
      result.push(row);
    }
  });

  return result;
}


function getLatestDate(rows) {
  if (rows.length === 0) {
    throw new Error('There are no dates to find the latest from!');
  }
  else {
    rows.sort(dateComparator);
    return convertToDate(rows[0].date, rows[0].end);
  }
}


function getLatestDescription(rows) {
  if (rows.length === 0) {
    throw new Error('All the descriptions are GONE! Yikes!');
  }
  else {
    rows.sort(dateComparator);
    return rows[0].description;
  }
}


function dateComparator(row1, row2) {
  var date1 = convertToDate(row1.date, row1.end);
  var date2 = convertToDate(row2.date, row2.end);

  return date2 - date1;
}


function sumTotalTime(rows) {
  var hours = 0;
  var minutes = 0;

  rows.forEach(function(row) {
    var total = row.total.split(':');
    
    hours += parseInt(total[0]);
    minutes += parseInt(total[1]);
  });

  return {
    hours: hours + Math.floor(minutes / 60),
    minutes: minutes % 60
  };
}


function convertToDate(dateString, timeString) {
  var date, year, month, day, hour, minute;

  if (dateString == 'today') {
    date = new Date();
    day = date.getDate();
    month = date.getMonth();
    year = date.getFullYear();
  }
  else if (dateString == 'yesterday') {
    date = new Date();
    date.setDate(date.getDate() - 1);
    day = date.getDate();
    month = date.getMonth();
    year = date.getFullYear();
  }
  // date format is DD/MM/YYYY
  else if (isValidFormat(dateString, validDateSlashFormats)) {
    date = dateString.split('/');
    day = date[0];
    month = date[1] - 1;
    year = date[2];
  }
  // date format is YYYY-MM-DD
  else if (isValidFormat(dateString, validDateDashFormats)) {
    date = dateString.split('-');
    year = date[0];
    month = date[1];
    day = date[2];
  }
  else {
    throw new Error('Sweet = DD/MM/YY or YY-MM-DD, not ' + dateString);
  }
  
  if (timeString == 'now') {
    date = new Date();
    hour = date.getHours();
    minute = date.getMinutes();
  }
  else if (isValidFormat(timeString, validTimeFormats)) {
    var time = timeString.split(':');
    hour = time[0];
    minute = time[1] || 0;
  }
  else {
    throw new Error('I\'m terribly sorry, but ' + timeString + ' does not look like a sweet time format to me.');
  }

  return new Date(year, month, day, hour, minute);
}


function isValidFormat(text, validFormats) {
  for (var i = 0; i < validFormats.length; ++i) {
    if (validFormats[i].test(text)) {
      return true;
    }
  }
  return false;
}
