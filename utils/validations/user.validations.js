import Joi from "joi";

// Sign-up validation schema aligned with user.model.js
export const signUpValidationSchema = Joi.object({
    fullName: Joi.string().trim().min(3).max(50).required(),
    username: Joi.string().alphanum().trim().min(3).max(30).required(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .trim()
        .lowercase()
        .required(),
    password: Joi.string().alphanum().trim().min(6).max(20).required(),
    confirmPassword: Joi.any()
        .valid(Joi.ref("password"))
        .messages({ "any.only": "Passwords do not match" })
        .required(),
    profileImg: Joi.string().uri().optional(),
});

// Login schema
export const loginValidationSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .trim()
        .lowercase()
        .required(),
    password: Joi.string().alphanum().trim().required(),
});

// Update user schema
export const updateUserValidationSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .trim()
        .lowercase()
        .optional(),
    fullName: Joi.string().trim().min(3).max(50).optional(),
    username: Joi.string().alphanum().trim().min(3).max(30).optional(),
    bio: Joi.string().min(10).optional(),
    profileImg: Joi.string().uri().optional(),
    coverImg: Joi.string().uri().optional(),
    link: Joi.string().uri().optional(),
}).min(1);