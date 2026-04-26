import express from "express";
import {
  createHotel,
  getApprovedHotels,
  getSingleHotel,
  getMyHotel,
  searchHotels,
  updateMyHotel,
  getManagerDashboard,
} from "../controllers/hotel.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", getApprovedHotels);
router.get("/search", searchHotels);
router.get("/my-hotel", protect, authorizeRoles("manager"), getMyHotel);
router.get("/manager/dashboard",protect,authorizeRoles("manager"),getManagerDashboard);

router.get("/:id", getSingleHotel);

router.post("/", protect, authorizeRoles("manager"), createHotel);
router.put("/my-hotel", protect, authorizeRoles("manager"), updateMyHotel);

export default router;
