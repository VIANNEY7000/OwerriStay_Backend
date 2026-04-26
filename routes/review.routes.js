import express from "express";
import {
  createReview,
  getHotelReviews,
  updateMyReview,
  deleteMyReview,
} from "../controllers/review.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/hotel/:hotelId", getHotelReviews);

router.post("/", protect, authorizeRoles("guest"), createReview);
router.put("/:reviewId", protect, authorizeRoles("guest"), updateMyReview);
router.delete("/:reviewId", protect, authorizeRoles("guest"), deleteMyReview);

export default router;
