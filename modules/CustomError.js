class CustomError extends Error {
    constructor(message, statusCode = 400, field) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 500 ? "error" : "fail";
        this.field = field;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;
