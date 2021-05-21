const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewSchema = require("./review");

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  img: String,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    const reviews = doc.reviews;
    for (let review of reviews) {
      const ans = await reviewSchema.findByIdAndDelete(review);
      console.log(ans);
    }
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
