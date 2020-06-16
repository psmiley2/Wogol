const express = require("express");
const router = express.Router();
const { ObjectID } = require("mongodb");

const { Track } = require("../models/Track");

/* ----------------------------- Add a new Track ---------------------------- */
router.post("/", async (req, res) => {
	let errors = [];
	let { title, description, author, checkpoints } = req.body;
	let newTrack = new Track({
		_id: new ObjectID(),
		title,
		description,
		author,
		checkpoints,
	});

	let track = await newTrack.save().catch((err) => {
		errors.push("error occurred while adding the user to the database");
		console.error(err);
	});

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(201).send(track);
	}
});

/* ---------------------------- Fetch all tracks ---------------------------- */
router.get("/", async (req, res) => {
	let errors = [];

	let allTracks = await Track.find({}).catch((err) => {
		errors.push("error when making request to the database");
		console.error(err);
	});

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send(allTracks);
	}
});

/* ------------------------------ Fetch a track ----------------------------- */
router.get("/trackID", async (req, res) => {
	let { trackID } = req.params;
	let errors = [];

	if (trackID == undefined || trackID.length != 24) {
		errors.push("a valid trackID must be set as a url parameter");
	}

	if (errors.length > 0) {
		res.status(400).send(errors);
		return;
	}

	let track = await Track.findById(trackID).catch((err) => {
		errors.push("error making query to database");
		console.error(err);
	});

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send(track);
	}
});

module.exports = router;
