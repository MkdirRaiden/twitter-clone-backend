import express from "express";
import { protectRoute } from "../middlewares/protect.midldlewares.js";
import {
    signup,
    login,
    logout,
    getMe,
} from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);

export default router;
