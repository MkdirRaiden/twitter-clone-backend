import Joi from "joi";

export const createPostValidationSchema = Joi.object({
    text: Joi.string().trim().allow("", null),
    img: Joi.string().uri().trim().allow("", null),
}).custom((value, helpers) => {
    if (!value.text && !value.img) {
        return helpers.error("any.custom", { message: "Post must contain either text or image." });
    }
    return value;
}).messages({
    "any.custom": "{{#message}}",
});

export const updatePostValidationSchema = Joi.object({
    text: Joi.string().trim().allow("", null),
    img: Joi.string().uri().trim().allow("", null),
}).min(1).messages({
    "object.min": "At least one field (text or img) must be provided for update.",
});

