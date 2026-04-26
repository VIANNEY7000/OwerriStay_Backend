import User from "../models/User.model.js";
import Hotel from "../models/Hotel.model.js";
import Booking from "../models/Booking.model.js";



// GET PENDING MANAGER
export const getPendingManagers = async (req, res) => {
  try {
    const pendingManagers = await User.find({
      role: "manager",
      isApproved: false,
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: pendingManagers.length,
      data: pendingManagers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// APPROVE MANAGER
export const approveManager = async (req, res) => {
  try {
    const { managerId } = req.params;

    const manager = await User.findById(managerId);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    if (manager.role !== "manager") {
      return res.status(400).json({
        success: false,
        message: "This user is not a manager",
      });
    }

    if (manager.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Manager is already approved",
      });
    }

    manager.isApproved = true;
    await manager.save();

    return res.status(200).json({
      success: true,
      message: "Manager approved successfully",
      data: {
        _id: manager._id,
        fullName: manager.fullName,
        email: manager.email,
        role: manager.role,
        isApproved: manager.isApproved,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET PENDING HOTELS
export const getPendingHotels = async (req, res) => {
  try {
    const pendingHotels = await Hotel.find({ isApproved: false }).populate(
      "manager",
      "fullName email phoneNumber"
    );

    return res.status(200).json({
      success: true,
      count: pendingHotels.length,
      data: pendingHotels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// APPROVE HOTELS
export const approveHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    if (hotel.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Hotel is already approved",
      });
    }

    hotel.isApproved = true;
    await hotel.save();

    return res.status(200).json({
      success: true,
      message: "Hotel approved successfully",
      data: hotel,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// GET ADMIN DASHBOARD
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalManagers = await User.countDocuments({ role: "manager" });
    const pendingManagers = await User.countDocuments({
      role: "manager",
      isApproved: false,
    });

    const totalHotels = await Hotel.countDocuments();
    const pendingHotels = await Hotel.countDocuments({ isApproved: false });
    const approvedHotels = await Hotel.countDocuments({ isApproved: true });

    const totalBookings = await Booking.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalManagers,
        pendingManagers,
        totalHotels,
        pendingHotels,
        approvedHotels,
        totalBookings,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
