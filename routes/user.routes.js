import express from "express";
import { getMyProfile, updateMyProfile } from "../controllers/user.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", protect, getMyProfile);
router.put("/profile", protect, updateMyProfile);

export default router;




