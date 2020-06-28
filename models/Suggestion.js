const mongoose = require("mongoose");

const SuggestionSchema = new mongoose.Schema({
	suggestion: {
		type: String,
		required: true,
	},
});

const Suggestion = mongoose.model("SuggestionSchema", SuggestionSchema, "suggestion");

module.exports = Suggestion;
