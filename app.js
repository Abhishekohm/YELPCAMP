const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { createHash } = require("crypto");

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

app.get("/campground", async (req, res) => {
  const infos = await Campground.find({});
  res.render("campground", { infos });
});

app.get("/campground/new", (req, res) => {
  res.render("newCampground");
});

app.post("/campground", async (req, res, next) => {
  try {
    const data = new Campground(req.body);
    await data.save();
    res.redirect(`campground/${data._id}`);
  } catch (e) {
    next(e);
  }
});

app.get("/campground/:id", async (req, res) => {
  const info = await Campground.findById(req.params.id);
  res.render("show", { info });
});

app.get("/campground/:id/edit", async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await Campground.findById(id);
    res.render("edit", { data });
  } catch (e) {
    next(e);
  }
});

app.put("/campground/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body },
    { useFindAndModify: false }
  );
  res.redirect(`/campground/${id}`);
});

app.delete("/campground/:id/delete", async (req, res) => {
  const campground = await Campground.findByIdAndDelete(req.params.id);
  res.redirect("/campground");
});

app.use((err, req, res, next) => {
  console.log("WE MET SOME ERROR");
  res.send("Error");
});
