var quotes = [
  '"Time is really the only capital that any human being has, and the only thing he can’t afford to lose."\n~Thomas Edison',
  '"He that has time has life."\n~English Proverb',
  '"Time is more valuable than money. You can get more money, but you cannot get more time."\n~Jim Rohn',
  '"An ounce of gold will not buy an inch of time."\n~Chinese Proverb',
  '"Until you value yourself, you will not value your time. Until you value your time, you will not do anything with it."\n~M. Scott Peck',
  '"Time is the most valuable thing a man can spend."\n~Theophrastus',
  '"If you love life, don\'t waste time, for time is what life is made up of."\n~Bruce Lee',
  '"Time and space are fragments of the infinite for the use of finite creatures."\n~Henri Frederic Amiel',
  '"All that really belongs to us is time; even he who has nothing else has that."\n~Baltasar Gracian',
  '"Your greatest resource is your time."\n~Brian Tracy',
  '"Time is money."\n~Benjamin Franklin',
  '"Until we can manage time, we can manage nothing else."\n~Peter F. Drucker'
];


exports.getQuote = function() {
  var index = Math.floor(Math.random() * quotes.length);

  return quotes[index];
};


module.exports = exports;
