import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { xss } from "express-xss-sanitizer";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import CustomError from "./modules/CustomError.js";
import globalErrorHandler from "./controllers/error.controllers.js";

const app = express();

// Trust first proxy 
app.set("trust proxy", 1);

// Security: CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// Security: HTTP headers, sanitization, and rate limiting
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
  message: "Too many requests from this IP, please try again after 15 minutes."
}));

// Parsing
app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Catch-all 404
app.all("*", (req, res, next) => {
  next(new CustomError(`Page with url: ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(globalErrorHandler);

export default app;
