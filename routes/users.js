const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const passport = require("passport");

router.post("/register", async (req, res, next) => {
  try {
    const { username, password, email } = req.body.user;
    const user = new User({ email, username });
    const newUser = await User.register(user, password);
    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Created  a new User");
      res.redirect("/campground/all");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

router.get("/register", (req, res) => {
  res.render("user/register");
});

router.get("/login", (req, res) => {
  res.render("user/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    if (req.session.returnTo) {
      const route = req.session.returnTo;
      delete req.session.returnTo;
      res.redirect(route);
    } else {
      req.flash("success", "Sucessfully logged in");
      res.redirect("/campground/all");
    }
  }
);

router.get("/logout", (req, res, next) => {
  req.logOut();
  req.flash("success", "GoodBye!!!");
  res.redirect("/campground/all");
});

module.exports = router;
