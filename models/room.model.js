import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomType: {
      type: String,
      enum: ["standard", "duplex", "exclusive"],
      required: true,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    totalRooms: {
      type: Number,
      required: true,
      min: 1,
    },

    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },

    maxGuests: {
      type: Number,
      required: true,
      min: 1,
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

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

roomSchema.index({ hotel: 1, roomType: 1 }, { unique: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;
