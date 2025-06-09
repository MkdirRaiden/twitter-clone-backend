import dotenv from "dotenv";
import mongoose from "mongoose";
import { handleTerminationSignals, handleUncaughtException, handleUnhandledRejection } from "./utils/handlers/error.handlers.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config(); // Load env vars first

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Register sync error handler early
handleUncaughtException();

import app from "./app.js";

// Connect to DB and start server
mongoose.connect(process.env.MONGO_LOCAL_STR, {})
  .then(() => {
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      // Handle async errors after server is running
      handleUnhandledRejection(server);
      handleTerminationSignals(server);
    });
  })
  .catch((err) => {
    console.error(`DBConnectionError: ${err.name} - ${err.message}`);
    process.exit(1);
  });
