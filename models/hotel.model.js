import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      default: "Imo",
      trim: true,
    },

    city: {
      type: String,
      default: "Owerri",
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },

    amenities: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
