const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userScehma = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
});

userScehma.plugin(passportLocalMongoose); // Add password and username feild and checks its unique

module.exports = mongoose.model("User", userScehma);
