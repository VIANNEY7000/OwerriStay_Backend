import Booking from "../models/Booking.model.js";
import Hotel from "../models/Hotel.model.js";
import Room from "../models/Room.model.js";


// CREAT BOOKING
export const createBooking = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      numberOfRooms,
      paymentMethod,
    } = req.body;

    if (
      !hotelId ||
      !roomId ||
      !checkInDate ||
      !checkOutDate ||
      !numberOfGuests ||
      !numberOfRooms ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Hotel, room, check-in date, check-out date, number of guests, number of rooms, and payment method are required",
      });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel || !hotel.isApproved) {
      return res.status(404).json({
        success: false,
        message: "Approved hotel not found",
      });
    }

    const room = await Room.findOne({
      _id: roomId,
      hotel: hotelId,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found for this hotel",
      });
    }

    if (numberOfGuests > room.maxGuests * numberOfRooms) {
      return res.status(400).json({
        success: false,
        message: "Selected room(s) cannot accommodate this number of guests",
      });
    }

    if (numberOfRooms > room.availableRooms) {
      return res.status(400).json({
        success: false,
        message: "Not enough rooms available",
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const numberOfNights = Math.ceil((checkOut - checkIn) / oneDay);

    const totalPrice = room.pricePerNight * numberOfRooms * numberOfNights;

    const booking = await Booking.create({
      guest: req.user._id,
      hotel: hotel._id,
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests,
      numberOfRooms,
      totalPrice,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      bookingStatus: paymentMethod === "online" ? "confirmed" : "pending",
    });

    room.availableRooms -= numberOfRooms;
    await room.save();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET MY BOOKINGS
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ guest: req.user._id })
      .populate("hotel", "name address city state location")
      .populate("room", "roomType pricePerNight");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET SINGLE BOOKING
export const getSingleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("guest", "fullName email phoneNumber")
      .populate("hotel", "name address city state location")
      .populate("room", "roomType pricePerNight");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      booking.guest._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// CANCEL BOOKING
export const cancelMyBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only cancel your own booking",
      });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    const room = await Room.findById(booking.room);

    if (room) {
      room.availableRooms += booking.numberOfRooms;
      await room.save();
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET MANAGER BOOKINGS
export const getManagerBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Manager has no hotel",
      });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("guest", "fullName email phoneNumber")
      .populate("room", "roomType pricePerNight");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE BOOKING STATUS
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus } = req.body;

    const allowedStatuses = ["confirmed", "checked_in", "checked_out", "cancelled"];

    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Manager has no hotel",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      hotel: hotel._id,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL BOOKINGS
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("guest", "fullName email")
      .populate("hotel", "name city state location")
      .populate("room", "roomType pricePerNight");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
