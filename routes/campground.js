const cloudinary = require("cloudinary").v2;
const express = require("express");
const router = express.Router();
const Campground = require("./../models/campground");
const methodOverride = require("method-override");
const ExpressError = require("./../utility/ExpressError");
const catchAsync = require("./../utility/catchAsync");
router.use(express.urlencoded({ extended: true }));
router.use(methodOverride("_method"));
const { isLoggedIn, isAuthor, validateForm } = require("../middleware");

//geocoding
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoder = mbxGeocoding({ accessToken: process.env.MapBox_Token });

// uploading images
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });

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
  "/all",
  isLoggedIn,
  upload.array("img"),
  validateForm,
  catchAsync(async (req, res, next) => {
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.location,
        limit: 1,
      })
      .send();
    let campground = new Campground(req.body);
    campground.img = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    campground = await campground.save();
    console.log(campground);
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
  isLoggedIn,
  isAuthor,
  upload.array("img"),
  validateForm,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    console.log("body-", req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    campground.img.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      }
      await campground.updateOne({
        $pull: { img: { filename: { $in: req.body.deleteImages } } },
      });
    }
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
