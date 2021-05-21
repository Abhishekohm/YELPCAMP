const Campground = require("./models/campground");
const ExpressError = require("./utility/ExpressError");
const {
  campgroundSchema,
  reviewValSchema,
} = require("./validationSchema/validationSchema");
const Review = require("./models/review");

module.exports.isLoggedIn = function (req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    console.log(req.orignalUrl);
    req.flash("error", "You must be logged in to view this page");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to do this");
    return res.redirect(`/campground/${id}`);
  }
  next();
};

module.exports.validateForm = (req, res, next) => {
  const result = campgroundSchema.validate(req.body);
  const { error } = result;
  if (error) {
    throw new ExpressError(error.message, 400);
  } else {
    next();
  }
};

module.exports.ValidateReview = (req, res, next) => {
  const { error } = reviewValSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.message, 404);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
