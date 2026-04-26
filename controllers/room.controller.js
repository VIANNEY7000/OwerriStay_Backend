import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";


// CREAT ROOM
export const createRoom = async (req, res) => {
  try {
    const {
      roomType,
      pricePerNight,
      totalRooms,
      availableRooms,
      maxGuests,
      amenities,
      images,
      videos,
      description,
    } = req.body;

    if (!roomType || !pricePerNight || !totalRooms || !availableRooms || !maxGuests) {
      return res.status(400).json({
        success: false,
        message:
          "Room type, price per night, total rooms, available rooms, and max guests are required",
      });
    }

    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Manager has no hotel yet",
      });
    }

    if (!hotel.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your hotel is awaiting admin approval",
      });
    }

    const existingRoom = await Room.findOne({
      hotel: hotel._id,
      roomType: roomType.toLowerCase(),
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "This room type already exists for your hotel",
      });
    }

    if (Number(availableRooms) > Number(totalRooms)) {
      return res.status(400).json({
        success: false,
        message: "Available rooms cannot be greater than total rooms",
      });
    }

    const room = await Room.create({
      hotel: hotel._id,
      roomType: roomType.toLowerCase(),
      pricePerNight,
      totalRooms,
      availableRooms,
      maxGuests,
      amenities,
      images,
      videos,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET HOTEL ROOMS
export const getHotelRooms = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const rooms = await Room.find({ hotel: hotelId });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET MY ROOMS
export const getMyRooms = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Manager has no hotel yet",
      });
    }

    const rooms = await Room.find({ hotel: hotel._id });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE ROOM
export const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Manager has no hotel yet",
      });
    }

    const room = await Room.findOne({
      _id: roomId,
      hotel: hotel._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const fields = [
      "pricePerNight",
      "totalRooms",
      "availableRooms",
      "maxGuests",
      "amenities",
      "images",
      "videos",
      "description",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        room[field] = req.body[field];
      }
    });

    if (room.availableRooms > room.totalRooms) {
      return res.status(400).json({
        success: false,
        message: "Available rooms cannot be greater than total rooms",
      });
    }

    await room.save();

    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE ROOM
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Manager has no hotel yet",
      });
    }

    const room = await Room.findOne({
      _id: roomId,
      hotel: hotel._id,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await room.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
