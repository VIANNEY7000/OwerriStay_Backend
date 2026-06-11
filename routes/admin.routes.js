import express from "express";
import {
  getPendingManagers,
  approveManager,
  getPendingHotels,
  approveHotel,
  getAdminDashboard,
  getAllManagers,
} from "../controllers/admin.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

// MANAGERS
router.get("/pending-managers", protect, authorizeRoles("admin"), getPendingManagers);
router.get("/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);
router.patch("/approve-manager/:managerId", protect, authorizeRoles("admin"), approveManager);
router.get("/managers", protect, authorizeRoles("admin"), getAllManagers)

// HOTELS
router.get("/pending-hotels", protect, authorizeRoles("admin"), getPendingHotels);
router.patch("/approve-hotel/:hotelId", protect, authorizeRoles("admin"), approveHotel);



export default router;
