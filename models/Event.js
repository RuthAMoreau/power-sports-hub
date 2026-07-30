const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    eventType: {
      type: String,
      required: true,
      enum: ["Game", "Practice", "Tournament", "Meeting", "Other"]
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    location: {
      type: String,
      trim: true,
      maxlength: 150
    },

    opponent: {
      type: String,
      trim: true,
      maxlength: 100
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Event", eventSchema);
