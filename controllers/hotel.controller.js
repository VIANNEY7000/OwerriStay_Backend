import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";
import Booking from "../models/booking.model.js";



// CREATE HOTEL
export const createHotel = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      state,
      city,
      location,
      starRating,
      amenities,
      images,
      videos,
    } = req.body;

    if (!name || !description || !address || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, description, address, and location are required",
      });
    }

    const existingHotel = await Hotel.findOne({ manager: req.user._id });

    if (existingHotel) {
      return res.status(400).json({
        success: false,
        message: "Manager already has a hotel",
      });
    }

    const hotel = await Hotel.create({
      manager: req.user._id,
      name,
      description,
      address,
      state: state || "Imo",
      city: city || "Owerri",
      location,
      starRating,
      amenities,
      images,
      videos,
    });

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully and is awaiting admin approval",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET APPROVED HOTEL
export const getApprovedHotels = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const sortOptions = {
      [sortBy]: order,
    };

    const totalHotels = await Hotel.countDocuments({ isApproved: true });

    const hotels = await Hotel.find({ isApproved: true })
      .populate("manager", "fullName email phoneNumber")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalHotels / limit),
      totalHotels,
      count: hotels.length,
      data: hotels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// SEARCH HOTELS
export const searchHotels = async (req, res) => {
  try {
    const {
      state,
      city,
      location,
      starRating,
      amenities,
      roomType,
      minPrice,
      maxPrice,
      sortBy,
      order,
    } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const hotelFilter = { isApproved: true };

    if (state) {
      hotelFilter.state = { $regex: state, $options: "i" };
    }

    if (city) {
      hotelFilter.city = { $regex: city, $options: "i" };
    }

    if (location) {
      hotelFilter.location = { $regex: location, $options: "i" };
    }

    if (starRating) {
      hotelFilter.starRating = Number(starRating);
    }

    if (amenities) {
      const amenitiesArray = amenities.split(",").map((item) => item.trim());
      hotelFilter.amenities = { $all: amenitiesArray };
    }

    let hotels = await Hotel.find(hotelFilter).populate(
      "manager",
      "fullName email phoneNumber"
    );

    if (roomType || minPrice || maxPrice) {
      const filteredHotels = [];

      for (const hotel of hotels) {
        const roomFilter = { hotel: hotel._id };

        if (roomType) {
          roomFilter.roomType = roomType.toLowerCase();
        }

        if (minPrice || maxPrice) {
          roomFilter.pricePerNight = {};

          if (minPrice) {
            roomFilter.pricePerNight.$gte = Number(minPrice);
          }

          if (maxPrice) {
            roomFilter.pricePerNight.$lte = Number(maxPrice);
          }
        }

        const matchingRoom = await Room.findOne(roomFilter);

        if (matchingRoom) {
          filteredHotels.push(hotel);
        }
      }

      hotels = filteredHotels;
    }

    if (sortBy) {
      hotels.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
        }

        if (typeof bValue === "string") {
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return order === "asc" ? -1 : 1;
        }

        if (aValue > bValue) {
          return order === "asc" ? 1 : -1;
        }

        return 0;
      });
    } else {
      hotels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const totalHotels = hotels.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedHotels = hotels.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalHotels / limit),
      totalHotels,
      count: paginatedHotels.length,
      data: paginatedHotels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// GET SINGLE HOTEL
export const getSingleHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate(
      "manager",
      "fullName email phoneNumber"
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET MY HOTEL
export const getMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this manager",
      });
    }

    return res.status(200).json({
      success: true,
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDTAE MY HOTEL
export const updateMyHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this manager",
      });
    }

    const fields = [
      "name",
      "description",
      "address",
      "state",
      "city",
      "location",
      "starRating",
      "amenities",
      "images",
      "videos",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hotel[field] = req.body[field];
      }
    });

    hotel.isApproved = false;
    await hotel.save();

    return res.status(200).json({
      success: true,
      message: "Hotel updated successfully and sent for admin re-approval",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET MANAGER DASHBOARD
export const getManagerDashboard = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ manager: req.user._id });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found for this manager",
      });
    }

    const totalRooms = await Room.countDocuments({ hotel: hotel._id });
    const totalBookings = await Booking.countDocuments({ hotel: hotel._id });
    const pendingBookings = await Booking.countDocuments({
      hotel: hotel._id,
      bookingStatus: "pending",
    });
    const confirmedBookings = await Booking.countDocuments({
      hotel: hotel._id,
      bookingStatus: "confirmed",
    });

    return res.status(200).json({
      success: true,
      data: {
        hotelId: hotel._id,
        hotelName: hotel.name,
        hotelApproved: hotel.isApproved,
        totalRooms,
        totalBookings,
        pendingBookings,
        confirmedBookings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
