const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = joi
  .object({
    title: joi.string().required().escapeHTML(),
    price: joi.number().required().min(0),
    description: joi.string().required().escapeHTML(),
    location: joi.string().required().escapeHTML(),
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
      body: joi.string().required().escapeHTML(),
      rating: joi.number().required().min(0).max(5),
    })
    .required(),
});
