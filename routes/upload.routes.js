import express from "express";
import { uploadMedia } from "../controllers/upload.controller.js";
import protect from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/", protect, upload.single("file"), uploadMedia);

export default router;
