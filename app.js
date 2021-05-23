const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const campgroundRoute = require("./routes/campground");
const reviewRoute = require("./routes/reviews");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const UserRoute = require("./routes/users");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs"); // for template
app.set("views", path.join(__dirname, "views")); // path is used so that we can call it from any where
app.use(express.urlencoded({ extended: true })); // TO BE ABLE TO READ FORM DATA
app.use(methodOverride("_method")); // TO SEND POST PATCH AND DELETE REQ FROM A FORM _method can be anythingwewant
app.use(express.static(path.join(__dirname, "public")));

// SESSION CONFIG
const sessionConfig = {
  secret: "setAGoodSecretInProduction",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionConfig));

//flash

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
//  **************************************** Routes ************************************************************

app.use("/", UserRoute);
app.use("/campground", campgroundRoute);
app.use("/campground/:id/reviews", reviewRoute);

// ------------------------------------------------------------------------------------------------------------

mongoose.connect("mongodb://localhost/yelpcamp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("conneced to mongoose");
});

// Home page
app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("Listening to server 3000");
});

// app.get("/fakeuser", async (req, res) => {
//   const user = new User({ email: "asd@gmail.com", username: "Qwerty" });
//   const newUser = await User.register(user, "hello");
//   res.send(newUser);
// });
