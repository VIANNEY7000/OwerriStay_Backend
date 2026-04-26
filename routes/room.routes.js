import express from "express";
import {
  createRoom,
  getHotelRooms,
  getMyRooms,
  updateRoom,
  deleteRoom,
} from "../controllers/room.controller.js";
import protect from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/my-rooms", protect, authorizeRoles("manager"), getMyRooms);
router.get("/hotel/:hotelId", getHotelRooms);

router.post("/", protect, authorizeRoles("manager"), createRoom);
router.put("/:roomId", protect, authorizeRoles("manager"), updateRoom);
router.delete("/:roomId", protect, authorizeRoles("manager"), deleteRoom);

export default router;
