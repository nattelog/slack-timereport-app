/**
 * Trax Parser interprets text received from Slack and converts it to objects 
 * readable by Trax.
 */


var config = require('../config');
var assert = require('assert');


var validDates = [
    /^today$/,
    /^yesterday$/,
    /^\d{4}[-]\d{1,2}[-]\d{1,2}$/,
    /^\d{2}[-]\d{1,2}[-]\d{1,2}$/
];


var validTimes = [
    /^\d{1,2}$/,
    /^\d[:]\d$/,
    /^\d[:]\d{2}$/,
    /^\d{2}[:]\d$/,
    /^\d{2}[:]\d{2}$/
];


/**
 * Parses text and returns an object readable by Trax.
 *
 * Valid syntax for parser:
 *   [<day>] ["from" <start> ["to" <end>] "with"] "<description>"
 * 
 *   <day> - "today", "yesterday" or "YYYY-MM-DD"
 *   <start>/<end> - "H", "H:MM" or "HH:MM"
 *   <description> - Any string, must be within quotes ("blabla")
 *
 * @param text - The text to parse and convert
 * @return (Object) {
 *   dates: {
 *     t1: (optional) - Date where tracking starts
 *     t2: (optional) - Date where tracking ends
 *   }
 *   description - The description of the track
 * }
 */
exports.parse = function(text) {
  text = require('minimist')(text.split(' '), {
    default: {
      d: 'today',
      f: 'latest',
      t: 'now'
    }
  });
  console.dir(text);

  var date = text.d;
  var t1 = text.f;
  var t2 = text.t;
  var description = text._.join(' ').trim();

  assert(description, 'You need to describe what you did.');

  

  // check if text starts with a description
  /*if (/^"/.test(text)) {
    return {
      dates: {
	t1: undefined,
	t2: undefined
      },
      description: parseDescription(text)
    };
  }
  else {
    // look for the 'with' word and split the text on that
    var withIndex = text.indexOf('with');
    var dateText = text.substring(0, withIndex);
    var descriptionText = text.substring(withIndex+4, text.length);
    var result = {};

    result.description = parseDescription(descriptionText);
    result.dates = parseDates(dateText);

    return result;
  }

  
  text = text.split(' ');

  // text starts with description, i.e. a quotation mark
  if (/^"/.test(text[0])) {
    return makeReturn(makeDescription(text));
  }
  else if (isValidDate(text[0])) {
    return parseManualTrack(text);
  }
  else if (text[0] == 'from') {

  }
  else if (text[0] == 'help') {
    return makeReturn(makeDescription(['"help"']));
  }
  else {
    throw new Error('I\'m sorry, but that command was like Fortran code to me. Please try something else or type `' + config.slack.command  + ' help`.');
  }*/
};


function makeReturn(description, t1, t2) {
  return {
    description: description,
    t1: t1,
    t2: t2
  };
}


function parseManualTrack(text) {
  var day = text.shift();
  var start, end, description;

  if (text.shift() != 'from') {
    badSyntax();
  }
  
  start = makeDate(text.shift());

  var _tmp = text.shift();

  if (_tmp == 'to') {
    end = makeDate(text.shift());
  }
  else if (_tmp == 'with') {
    text.shift();
    description = makeDescription(text);
  }
  else {
    badSyntax();
  }

  day = text.shift();

  
  
  return makeReturn('That was a nice date, but it still didn\'t work.');
}


function badSyntax() {
  throw new Error('I did not understand that.');
}


function makeDate(text) {
  if (text == 'today') {
    return new Date();
  }
  else if (text == 'yesterday') {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }
  else {
    var dateArr = text.split('-');
    
  }
}


function makeDateFromTime(text) {

}


function makeDescription(text) {
  assert(/^"/.test(text[0]), 'Description must start with a \".');
  
  var description = text.shift().substring(1); // remove the quotation mark

  while (text.length > 0) {
    description += ' ' + text.shift();
  }

  if (description.charAt(description.length-1) != '"') {
    throw new Error('Your description did not end with a quotation mark.');
  }
  
  return description.substring(0, description.length-1); // remove last quotation mark
}


function isValidDate(text) {
  for (var i = 0; i < validDates.length; ++i) {
    if (validDates[i].test(text)) {
      return true;
    }
  }
  return false;
}


function isValidTime(text) {
  for (var i = 0; i < validTimes.length; ++i) {
    if (validTimes[i].test(text)) {
      return true;
    }
  }
  return false; 
}


module.exports = exports;
