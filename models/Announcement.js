const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },

    audience: {
      type: String,
      enum: ["Everyone", "Coaches", "Parents", "Players"],
      default: "Everyone"
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Announcement",
  announcementSchema
);
