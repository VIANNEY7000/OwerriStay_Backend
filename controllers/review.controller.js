import Hotel from "../models/Hotel.model.js";
import Review from "../models/Review.model.js";


// CREATR REVIEW
export const createReview = async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;

    if (!hotelId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Hotel, rating, and comment are required",
      });
    }

    const hotel = await Hotel.findById(hotelId);

    if (!hotel || !hotel.isApproved) {
      return res.status(404).json({
        success: false,
        message: "Approved hotel not found",
      });
    }

    const existingReview = await Review.findOne({
      hotel: hotelId,
      guest: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this hotel",
      });
    }

    const review = await Review.create({
      hotel: hotelId,
      guest: req.user._id,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET HOTEL REVIEWS
export const getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const reviews = await Review.find({ hotel: hotelId })
      .populate("guest", "fullName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE MY REVIEW
export const updateMyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review",
      });
    }

    if (rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE MY REVIEW
export const deleteMyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.guest.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
