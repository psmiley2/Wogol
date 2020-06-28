const express = require("express");
require("dotenv").config();

let app = express();

// Database
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

console.log("mongo url", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// Express session
const session = require("express-session");
var MongoStore = require("connect-mongo")(session);
app.use(
	session({
		secret: "secret", // TODO -  MAKE THIS A LEGIT AND HIDDEN SECRET
		resave: true,
		saveUninitialized: true,
		cookie: { maxAge: 2 * 60 * 60 * 1000 },
		store: new MongoStore({
			mongooseConnection: mongoose.connection,
			ttl: 2 * 24 * 60 * 60,
		}),
	})
);

// Cors
const cors = require("cors");
app.use(
	cors({
		origin: ["http://localhost:3000"],
		credentials: true,
	})
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

// Routes
app.use("/users", require("./routes/users"));
app.use("/tracks", require("./routes/tracks"));
// app.use("/tracks", require("./routes/tracks")); HABITS

// Server Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Listening on PORT: ${PORT}`));
