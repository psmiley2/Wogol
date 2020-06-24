const mongoose = require("mongoose");
const { TaskSchema } = require("./Task");

const CheckpointSchema = new mongoose.Schema({
	title: {
		type: String,
		default: "",
		required: true,
	},
	description: {
		type: String,
		default: "",
		required: true,
	},
	tasks: {
		type: [TaskSchema],
		default: [],
	},
	completed: {
		type: Boolean,
		default: false,
	},
	current: {
		type: Boolean,
		default: false,
	},
});

const Checkpoint = mongoose.model(
	"CheckpointSchema",
	CheckpointSchema,
	"Checkpoint"
);

module.exports = {
	CheckpointSchema,
	Checkpoint,
};
