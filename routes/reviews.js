const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("./../utility/catchAsync");
const ExpressError = require("./../utility/ExpressError");
const reviewSchema = require("./../models/review");
const Campground = require("./../models/campground");
const { ValidateReview, isReviewAuthor, isLoggedIn } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  ValidateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new reviewSchema(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campground/${campground._id}`);
  })
);
// localhost:3000/campground/60b9b8ab81d11416e0da8bb0/reviews/60ba246a9426ad1a88b58adf/delete?_method=DELETE
http: router.delete(
  "/:reviewId/delete",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (req, res) => {
    console.log("you were here");
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });
    await reviewSchema.findByIdAndDelete(reviewId);
    res.redirect(`/campground/${id}`);
  })
);
router.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

router.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  if (!err.message) err.message = "Oh No, Something went wrong";
  res.status(statusCode);
  res.render("error", { err });
});

module.exports = router;

//60a36857e372f23514c5b315
