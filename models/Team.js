const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: {
      type: String,
      required: true,
      trim: true
    },

    ageGroup: {
      type: String,
      required: true,
      trim: true
    },

    season: {
      type: String,
      required: true,
      trim: true
    },

    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Team", teamSchema);
