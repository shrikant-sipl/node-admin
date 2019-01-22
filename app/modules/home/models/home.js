var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var UserSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String }
})
.index({
      'email':'text'     
});



module.exports = mongoose.model('Users', UserSchema);

