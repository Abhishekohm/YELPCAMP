if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
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
const sanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");

app.engine("ejs", ejsMate); ///for boilerPlate
app.set("view engine", "ejs"); // for template
app.set("views", path.join(__dirname, "views")); // path is used so that we can call it from any where
app.use(express.urlencoded({ extended: true })); // TO BE ABLE TO READ FORM DATA
app.use(methodOverride("_method")); // TO SEND POST PATCH AND DELETE REQ FROM A FORM _method can be anythingwewant
app.use(express.static(path.join(__dirname, "public")));
app.use(sanitize());

//HELMET

// app.use(helmet());

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://res.cloudinary.com/abhishekprivatelimited/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//         "https://images.unsplash.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );

// SESSION CONFIG

// const store = new MongoStore({
//   url: "mongodb://localhost/yelpcamp",
//   secret: "thisismeanttobeasecretsodontreadit",
//   touchAfter: 24 * 60 * 60,
// });

// store.on("error", (e) => {
//   console.log("error", e);
// });

const dbUrl = process.env.DB_URL || "mongodb://localhost/yelpcamp";
const secret = process.env.Secret || "thisismeanttobeasecretsodontreadit";

const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: "mongodb://localhost/yelpcamp",
    secret,
    touchAfter: 24 * 60 * 60,
  }),
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionConfig));

//passport

// All below unknown methods on userSchema are coming from passport-local-mongoose package
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

app.use("/campground/:id/reviews", reviewRoute);
app.use("/", UserRoute);
app.use("/campground", campgroundRoute);

// ------------------------------------------------------------------------------------------------------------

// "mongodb://localhost/yelpcamp"
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

const port = process.env.PORT || 3000;

app.listen(3000, () => {
  console.log(`Listening to server ${port}`);
});
