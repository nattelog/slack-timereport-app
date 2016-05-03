exports.setupGoogleSpreadsheet = function(token, creds, user, done) {
  var GoogleSpreadsheet = require('google-spreadsheet');
  var async = require('async');
  var doc = new GoogleSpreadsheet(token);
  var sheet;
  
  async.series([
    function authenticate(step) {
      doc.useServiceAccountAuth(creds, step);
    },

    function getSheet(step) {
      doc.getInfo(function(err, info) {
	sheet = info.worksheets[0];
	sheet.setTitle(user, step);
      });
    },

    function clearSheet(step) {
      sheet.clear(step);
    },

    function resizeSheet(step) {
      sheet.resize({
	rowCount: 10,
	colCount: 5
      }, step);
    },

    function setHeaders(step) {
      sheet.setHeaderRow([
	'Date',
	'Start',
	'End',
	'Total',
	'Description'
      ], step);
    },

    function finish(step) {
      done(sheet);
    }
  ]);
};


module.exports = exports;
