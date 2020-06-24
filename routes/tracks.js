const express = require("express");
const router = express.Router();
const { ObjectID } = require("mongodb");

const { Track } = require("../models/Track");
const User = require("../models/User");

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
			let newCurrentCheckpoint;
			if (!user) {
				errors.push("could not find a user with the given id.");
			} else {
				if (user.tracks.length == 0) {
					errors.push("this user has no tracks");
				} else {
					for (track of user.tracks) {
						if (track._id == trackID) {
							console.log("current:", track.currentCheckpoint);
							if (track.currentCheckpoint == "") {
								user.currentCheckpoint = track.checkpoints[0];
								user.save();
								break;
							} else {
								for (
									let i = 0;
									i < track.checkpoints.length;
									i++
								) {
									if (
										track.checkpoints[i]._id ==
										track.currentCheckpoint
									) {
										if (
											track.checkpoints[i + 1] ==
											track.checkpoints.length
										) {
											res.status(200).send(
												"user finished the track"
											);
											return;
										} else {
											user.currentCheckpoint =
												track.checkpoints[i + 1];
											user.save();
										}
										break;
									}
									errors.push(
										"no checkpoint with that id exists for this user"
									);
								}
							}
							break;
						}
						errors.push(
							"no track with that id exists for this user"
						);
					}
				}
			}
		})
		.catch((err) => {
			errors.push("error making query to database");
			console.error(err);
		});

	if (errors.length > 0) {
		res.status(400).send(errors);
	} else {
		res.status(200).send("success");
	}
});

module.exports = router;
