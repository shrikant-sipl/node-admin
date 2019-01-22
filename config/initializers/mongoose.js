/*module.exports = function() {
	this.mongoose = require('mongoose');
	this.mongoose.connect(this.get('db-uri'));
	this.mongooseTypes = require("mongoose-types");
	this.mongooseTypes.loadTypes(this.mongoose);
};
*/
/************INIT MONGOOSE START***************/
var mongoose = require('mongoose');
var mongooseTypes = require("mongoose-types");
mongooseTypes.loadTypes(mongoose);
var settings = require('../settings');
var uristring = settings.db['mongo'];
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

/************INIT MONGOOSE END***************/

