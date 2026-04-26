import express from "express";
import {
  createBooking,
  getMyBookings,
  getSingleBooking,
  cancelMyBooking,
  getManagerBookings,
  updateBookingStatus,
  getAllBookings,
} from "../controllers/booking.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("guest"), createBooking);

router.get("/my-bookings", protect, authorizeRoles("guest"), getMyBookings);
router.get("/manager", protect, authorizeRoles("manager"), getManagerBookings);
router.get("/admin", protect, authorizeRoles("admin"), getAllBookings);
router.get("/:bookingId", protect, getSingleBooking);

router.patch("/cancel/:bookingId", protect, authorizeRoles("guest"), cancelMyBooking);
router.patch("/status/:bookingId",protect, authorizeRoles("manager"),updateBookingStatus);

export default router;
