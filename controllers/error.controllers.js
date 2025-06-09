import Joi from "joi";
import CustomError from "../modules/CustomError.js";

// Dev error response
const sendDevError = (err, res) => {
    console.error(err.stack);
    res.status(err.statusCode).json({
        statusCode: err.statusCode,
        status: err.status,
        message: err.message,
        stackTrace: err.stack,
        error: err,
    });
};

// Prod error response
const sendProdError = (err, res) => {
    res.status(err.statusCode).json({
        data: {
            statusCode: err.statusCode,
            status: err.status,
            message: err.message,
            field: err.field || undefined,
        },
    });
};

// Error transformers
const transformCastError = (err) =>
    new CustomError(`Invalid document ID: ${err.value}`, 400);

const transformValidationError = (err) => {
    const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(". ");
    return new CustomError(message, 400);
};

const transformUniqueKeyError = (err) => {
    const key = Object.keys(err.keyValue)[0];
    const value = err.keyValue[key];
    return new CustomError(`${value} already exists`, 400);
};

const transformJoiError = (err) => {
    const field = err.details?.[0]?.context?.key || null;
    const message =
        err.details?.[0]?.message.replace(/['"/]/g, "") || "Invalid input";

    const customErr = new CustomError(message, 400);
    customErr.status = "fail"; // Mark as client error
    customErr.isOperational = true; // Mark as handled error
    if (field) customErr.field = field;

    return customErr;
};

const transformJWTError = () =>
    new CustomError("Invalid token, unauthorized", 403);

const transformTokenExpiredError = () =>
    new CustomError("Token expired, please login again", 403);

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode ||= 500;
    err.status ||= "error";

    const fallbackMessage = "Something went wrong, please try again later";
    if (err.status === "error") {
        err.message = err.message || fallbackMessage;
    }

    //  Always handle Joi validation errors first
    if (err instanceof Joi.ValidationError) err = transformJoiError(err);

    if (err.code === 11000) err = transformUniqueKeyError(err);

    const isDev = process.env.NODE_ENV === "development";
    const isProd = process.env.NODE_ENV === "production";

    if (isDev) return sendDevError(err, res);

    if (isProd) {
        if (!err.isOperational) {
            switch (err.name) {
                case "CastError":
                    err = transformCastError(err);
                    break;
                case "ValidationError":
                    err = transformValidationError(err);
                    break;
                case "JsonWebTokenError":
                    err = transformJWTError();
                    break;
                case "TokenExpiredError":
                    err = transformTokenExpiredError();
                    break;
            }
        }

        return sendProdError(err, res);
    }

    // fallback for unknown environment
    res.status(500).json({
        statusCode: 500,
        status: "error",
        message: fallbackMessage,
    });
};

export default globalErrorHandler;
