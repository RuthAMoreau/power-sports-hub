const express = require("express");

const Team = require("../models/Team");
const Player = require("../models/Player");
const Event = require("../models/Event");
const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");

const router = express.Router();

// Display dashboard
router.get("/", auth, async (req, res) => {
  try {
    const now = new Date();

    const [
      teamCount,
      playerCount,
      eventCount,
      announcementCount,
      upcomingEvents,
      recentAnnouncements
    ] = await Promise.all([
      Team.countDocuments(),
      Player.countDocuments(),
      Event.countDocuments({
        date: { $gte: now }
      }),
      Announcement.countDocuments(),

      Event.find({
        date: { $gte: now }
      })
        .populate("team", "teamName ageGroup")
        .sort({ date: 1 })
        .limit(5),

      Announcement.find()
        .populate("author", "firstName lastName")
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    res.render("dashboard/index", {
      user: req.session.user,
      teamCount,
      playerCount,
      eventCount,
      announcementCount,
      upcomingEvents,
      recentAnnouncements
    });
  } catch (err) {
    console.error("Dashboard loading error:", err);

    res.status(500).send(
      "Unable to load the dashboard."
    );
  }
});

module.exports = router;
