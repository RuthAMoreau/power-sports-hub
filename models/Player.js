const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    jerseyNumber: {
      type: Number,
      min: 0,
      max: 99
    },

    position: {
      type: String,
      trim: true,
      maxlength: 50
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true
    },

    parentName: {
      type: String,
      trim: true,
      maxlength: 100
    },

    parentEmail: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Player", playerSchema);
