var parser = require('../lib/trax-parser');


function makeDate(hour, minute) {
  var date = new Date();
  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);
  return date;
}


/*exports.testALotOfBadDates = function(test) {
  var badDates = [
    'bad_date',
    'todays',
    'yesterdays',
    'syesterdays',
    ' yesterday',
    '92-10-001',
    '2016-4-abd',
    '2015-4'
  ];

  badDates.forEach(function(text) {
    test.throws(function() {
      parser.parse(text + ' from 8 to 9 with "Work"');
    }, Error, '\"' + text + '\" should not pass as a valid date');
  });
    
  test.done();
};


exports.testALotOfValidDates = function(test) {
  var validDates = [
    'today',
    'yesterday',
    '16-04-19',
    '16-04-1',
    '16-4-1',
    '16-4-01',
    '2016-04-01',
    '2015-04-1',
    '2015-4-2',
    '2016-4-02'
  ];

  validDates.forEach(function(text) {
    test.doesNotThrow(function() {
      parser.parse(text + ' from 8 to 9 with "Work"');
    }, Error, '\"' + text + '\" should pass as a valid date');
  });

  test.done();
  };*/

exports.funnyTest = function(test) {
  parser.parse('-f 8 Jobbat');
  test.done();
};
