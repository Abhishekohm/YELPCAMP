const joi = require("joi");
module.exports.campgroundSchema = joi
  .object({
    title: joi.string().required(),
    price: joi.number().required().min(0),
    description: joi.string().required(),
    location: joi.string().required(),
    deleteImages: joi.array(),
  })
  .required();

module.exports.campgroundSchemaImg = joi
  .array()
  .items(
    joi.object({
      url: joi.string().required(),
      filename: joi.string().required(),
    })
  )
  .required();

module.exports.reviewValSchema = joi.object({
  review: joi
    .object({
      body: joi.string().required(),
      rating: joi.number().required().min(0).max(5),
    })
    .required(),
});
