const express = require("express");
const router = express.Router();
const Campground = require("./../models/campground");
const reviewSchema = require("./../models/review");
const methodOverride = require("method-override");
const { campgroundSchema } = require("./../validationSchema/validationSchema");
const ExpressError = require("./../utility/ExpressError");
const catchAsync = require("./../utility/catchAsync");
router.use(express.urlencoded({ extended: true }));
router.use(methodOverride("_method"));
const { isLoggedIn, isAuthor, validateForm } = require("../middleware");
const { findByIdAndUpdate } = require("./../models/review");

router.get(
  "/all",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campground", { campgrounds });
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("newCampground");
});

router.post(
  "/",
  isLoggedIn,
  validateForm,
  catchAsync(async (req, res, next) => {
    let campground = new Campground(req.body);
    campground.author = req.user._id;
    campground = await campground.save();
    req.flash("success", "SUCESSFULLY CREATED A CAMPGROUND");
    res.redirect(`/campground/${campground._id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    console.log(campground);
    if (!campground) {
      req.flash("error", "CANNOT FIND THIS CAMPGROUND");
      res.redirect("./all");
    }
    console.log(campground);
    res.render("show", { campground });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "CANNOT FIND THIS CAMPGROUND");
      res.redirect("/campground/all");
    }
    res.render("edit", { campground });
  })
);

router.put(
  "/:id",
  validateForm,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await findByIdAndUpdate(id, { ...req.body });
    req.flash("success", "SUCCESSFULLY UPDATED A CAMPGROUND");
    res.redirect(`/campground/${id}`);
  })
);

router.delete(
  "/:id/delete",
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "SUCCESSFULLY DELETED A CAMPGROUND");
    res.redirect("/campground/all");
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
