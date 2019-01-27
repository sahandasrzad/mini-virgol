var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	name:String,
	lastname:String,
	gender:String,
	phone:Number,
	password: String,
	avatar:String,
	isAdmin: {type: Boolean, default:false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);