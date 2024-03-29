const express = require("express");
const router = express.Router();
const { ObjectID } = require("mongodb");

const { Track } = require("../models/Track");
const User = require("../models/User");
const Suggestion = require("../models/Suggestion");
const { ensureAuthenticated } = require("../config/auth");

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

/* ------------------------ Fetch All Featured Tracks ----------------------- */
router.get("/featured", async (req, res) => {
	let errors = [];

	let featuredTracks = await Track.find({ featured: true }).catch((err) => {
		errors.push("error when making request to the database");
		console.error(err);
	});

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send(featuredTracks);
	}
});

/* ----------------------------- Suggest A Track ---------------------------- */
router.post("/suggestion", async (req, res) => {
	let errors = [];

	let newSuggestion = new Suggestion({
		suggestion: req.body.suggestion,
	});

	await newSuggestion.save().catch((err) => {
		errors.push("error occurred while adding the suggestion to the database");
		console.error(err);
	});

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(201).send("success");
	}
});

/* ------------------------------ Fetch a track ----------------------------- */
router.get("/:trackID", async (req, res) => {
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

	if (!track) {
		errors.push("could not find a track with the given track id");
	}

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send(track);
	}
});

/* ------------------------- Add A Track for A User ------------------------- */
router.post("/:userID", async (req, res) => {
	let { userID } = req.params;
	let track = req.body;
	let errors = [];

	if (userID == undefined || userID.length != 24) {
		errors.push("a valid userID must be set as a url parameter");
	}
	if (errors.length > 0) {
		res.status(400).send(errors);
		return;
	}

	let action = {
		$push: {
			tracks: track,
		},
	};
	let tracks = await User.findByIdAndUpdate(userID, action).catch((err) => {
		errors.push("error making query to database");
		console.error(err);
	});

	if (!tracks) {
		errors.push("could not find a user with the given id.");
	}

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send(tracks);
	}
});

/* ------------------------ Get All Tracks for a User ----------------------- */
router.get("/user/:userID", async (req, res) => {
	let { userID } = req.params;
	let errors = [];

	if (userID == undefined || userID.length != 24) {
		errors.push("a valid userID must be set as a url parameter");
	}
	if (errors.length > 0) {
		res.status(400).send(errors);
		return;
	}

	let response = await User.findById(userID).catch((err) => {
		errors.push("error making query to database");
		console.error(err);
	});

	if (!response) {
		errors.push("could not find a user with the given id.");
	}

	let tracks = response.tracks;

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send(tracks);
	}
});

/* ----------------------- Proceed to next checkpoint ----------------------- */
router.post("/nextCheckpoint/:userID/:trackID", async (req, res) => {
	let { userID, trackID } = req.params;
	let track = req.body;
	let errors = [];
	let userFinishedTrack = false;

	if (userID == undefined || userID.length != 24) {
		errors.push("a valid userID must be set as a url parameter");
	}
	if (trackID == undefined || trackID.length != 24) {
		errors.push("a valid trackID must be set as a url parameter");
	}
	if (errors.length > 0) {
		res.status(400).send(errors);
		return;
	}

	await User.findById(userID)
		.then((user) => {
			if (!user) {
				errors.push("could not find a user with the given id.");
			} else {
				// User was located in the DB
				if (user.tracks.length == 0) {
					errors.push("this user has no tracks");
				} else {
					// User has tracks
					for (track of user.tracks) {
						if (track._id == trackID) {
							// Found the correct track
							if (track.currentCheckpoint == "") {
								// If the user has not yet started the track, add the first checkpoint
								track.currentCheckpoint = track.checkpoints[0]._id;
								user.save();
								break;
							} else {
								// If the user has started the track, move to the next checkpoint
								for (let i = 0; i < track.checkpoints.length; i++) {
									if (i + 1 == track.checkpoints.length) {
										// The user completed all of the checkpoints
										userFinishedTrack = true;
										track.completed = true;
										user.save();
										break;
									} else {
										if (track.checkpoints[i]._id == track.currentCheckpoint) {
											// Found the correct checkpoint
											// Set the new checkpoint to the one after the previous current checkpoint
											track.currentCheckpoint = track.checkpoints[i + 1]._id;
											user.save();
											break;
										}
									}
									errors.push("no checkpoint with that id exists for this user");
								}
							}
							break;
						}
						errors.push("no track with that id exists for this user");
					}
				}
			}
		})
		.catch((err) => {
			errors.push("error making query to database");
			console.error(err);
		});

	if (userFinishedTrack) {
		res.status(201).send("track finished");
	} else if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(201).send("success");
	}
});

/* ------------------------ Fetch a track for a user ------------------------ */
router.get("/user/:userID/:trackID", async (req, res) => {
	let { userID, trackID } = req.params;
	let errors = [];

	if (userID == undefined || userID.length != 24) {
		errors.push("a valid userID must be set as a url parameter");
	}
	if (trackID == undefined || trackID.length != 24) {
		errors.push("a valid trackID must be set as a url parameter");
	}
	if (errors.length > 0) {
		res.status(400).send(errors);
		return;
	}

	let user = await User.findById(userID).catch((err) => {
		errors.push("error making query to database");
		console.error(err);
	});

	if (!user) {
		errors.push("could not find a user with the given id.");
	}

	let track = undefined;
	for (t of user.tracks) {
		if (t._id == trackID) {
			track = t;
			break;
		}
	}
	if (track == undefined) {
		errors.push("no track with that id was found for this user");
	}

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send(track);
	}
});

/* ------------------------------ Update A Task ----------------------------- */
router.post("/user/:userID/:trackID/:checkpointID/:taskID", async (req, res) => {
	let { userID, trackID, checkpointID, taskID } = req.params;
	let errors = [];
	if (checkpointID == undefined || checkpointID.length != 24) {
		errors.push("a valid checkpointID must be set as a url parameter");
	}
	if (userID == undefined || userID.length != 24) {
		errors.push("a valid userID must be set as a url parameter");
	}
	if (trackID == undefined || trackID.length != 24) {
		errors.push("a valid trackID must be set as a url parameter");
	}

	if (taskID == undefined || taskID.length != 24) {
		errors.push("a valid taskID must be set as a url parameter");
	}

	if (errors.length > 0) {
		res.status(400).send(errors);
		return;
	}

	let updatedTask = req.body;

	let action = {
		$set: { "tracks.$[track].checkpoints.$[checkpoint].tasks.$[task]": updatedTask },
	};
	let filters = {
		arrayFilters: [
			{ "track._id": trackID },
			{ "checkpoint._id": checkpointID },
			{ "task._id": taskID },
		],
	};

	await User.findByIdAndUpdate(userID, action, filters)
		.then((res) => {
			if (!res) {
				errors.push("no user was found with the given userid");
			}
		})
		.catch((err) => {
			console.error(err);
		});

	if (errors.length > 0) {
		res.status(400).send(errors);
		return;
	}

	// No errors
	res.status(201).send(updatedTask);
});

module.exports = router;
