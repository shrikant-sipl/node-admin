var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var moment = require('moment');

/* Code for users */
var UserSchema = new Schema({
    firstName: { type: String, trim: true, require: true },
    lastName: { type: String, trim: true, require: true },
    email: { type: String, trim: true, index: true, unique: true, require: true },
    password: { type: String, require: true },
    role: { type: String },
    gender: { type: String},
    phone: { type: String },
    status: { type: Number, default: 1 },
    deviceToken: { type: Array},
    deviceType: { type: String },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date }
})
var user =  mongoose.model('users', UserSchema);


/* All schemas */
module.exports = { user: user };
