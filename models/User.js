const mongoose = require("mongoose");
const { TrackSchema } = require("./Track");
const UserSchema = new mongoose.Schema({
	userInfo: {
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		created: {
			type: Date,
			default: Date.now,
		},
	},
	tracks: {
		type: [TrackSchema],
		default: [],
	},
});

const User = mongoose.model("UserSchema", UserSchema, "users");

module.exports = User;
