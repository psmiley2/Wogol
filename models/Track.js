const mongoose = require("mongoose");
const { CheckpointSchema } = require("./Checkpoint");
const TrackSchema = new mongoose.Schema({
	title: {
		type: String,
		default: "",
		required: false,
	},
	description: {
		type: String,
		default: "",
		required: false,
	},
	author: {
		type: String,
		default: "",
		required: false,
	},
	checkpoints: {
		type: [CheckpointSchema],
		default: [],
	},
	currentCheckpoint: {
		type: String,
		default: "",
	},
	completed: {
		type: Boolean,
		default: false,
	},
	featured: {
		type: Boolean,
		default: false,
	},
});

const Track = mongoose.model("TrackSchema", TrackSchema, "tracks");

module.exports = {
	TrackSchema,
	Track,
};
