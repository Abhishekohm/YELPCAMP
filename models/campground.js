const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewSchema = require("./review");

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  img: String,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

CampgroundSchema.post("findOneAndDelete", async (doc) => {
  const reviews = doc.reviews;
  if (doc) {
    for (let review of reviews) {
      const ans = await reviewSchema.findByIdAndDelete(review);
      console.log(ans);
    }
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
