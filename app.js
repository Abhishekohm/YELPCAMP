const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ExpressError = require("./utility/ExpressError");
const ejsMate = require("ejs-mate");
const {
  campgroundSchema,
  reviewValSchema,
} = require("./validationSchema/validationSchema");
const reviewSchema = require("./models/review");

const catchAsync = require("./utility/catchAsync");

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://localhost/yelpcamp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("conneced to mongoose");
});

app.listen(3000, () => {
  console.log("Listening to server 3000");
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get(
  "/campground",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campground", { campgrounds });
  })
);

app.get("/campground/new", (req, res) => {
  res.render("newCampground");
});

const validateForm = (req, res, next) => {
  const result = campgroundSchema.validate(req.body);
  const { error } = result;
  if (error) {
    throw new ExpressError(error.message, 400);
  } else {
    next();
  }
};

const ValidateReview = (req, res, next) => {
  const { error } = reviewValSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.message, 404);
  } else {
    next();
  }
};

app.post(
  "/campground",
  validateForm,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body);
    await campground.save();
    res.redirect(`campground/${campground._id}`);
  })
);

app.get(
  "/campground/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("show", { campground });
  })
);

app.get(
  "/campground/:id/edit",
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    res.render("edit", { campground });
  })
);

app.put(
  "/campground/:id",
  validateForm,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
      id,
      { ...req.body },
      { useFindAndModify: false }
    );
    res.redirect(`/campground/${id}`);
  })
);

app.post(
  "/campground/:id/reviews",
  ValidateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new reviewSchema(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
  })
);

app.delete(
  "/campground/:id/delete",
  catchAsync(async (req, res) => {
    const campground = await Campground.findByIdAndDelete(req.params.id);
    res.redirect("/campground");
  })
);

app.delete(
  "/campground/:campId/reviews/:reviewId/delete",
  catchAsync(async (req, res) => {
    const { campId, reviewId } = req.params;
    await Campground.findByIdAndUpdate(campId, {
      $pull: { reviews: reviewId },
    });
    await reviewSchema.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${campId}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Oh No, Something went wrong";
  res.status(statusCode);
  res.render("error", { err });
});
