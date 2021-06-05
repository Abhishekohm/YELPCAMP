const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const reviewSchema = require("./review");

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  img: [ImageSchema],
  description: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
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
