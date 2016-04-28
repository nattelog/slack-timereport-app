/**
 * Trax Parser interprets text received from Slack and converts it to objects 
 * readable by Trax.
 * 
 * [<day>] [<start> "to" <end> "with"] <description>
 */
module.exports = function(req, res, next) {
  var text = req.body.text || undefined;

  if (!text) {
    next(new Error('Text not found in request object'));
  }
  else if (text == 'test') {
    res.send({
      text: 'Well, thank you for that.'
    });
  }
  else {
    next();
  }
};
