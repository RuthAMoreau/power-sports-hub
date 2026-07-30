const express = require("express");

const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");

const router = express.Router();

// Show all announcements
router.get("/", auth, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("author", "firstName lastName name")
      .sort({ createdAt: -1 });

    res.render("announcements/index", {
      announcements,
      user: req.session.user
    });
  } catch (err) {
    console.error("Announcement listing error:", err);

    res.status(500).send(
      "Unable to load announcements."
    );
  }
});

// Show new-announcement form
router.get("/new", auth, (req, res) => {
  res.render("announcements/new", {
    error: null,
    formData: {}
  });
});

// Create announcement
router.post("/", auth, async (req, res) => {
  const { title, message, audience } = req.body;

  if (!title || !message) {
    return res.status(400).render(
      "announcements/new",
      {
        error: "Title and message are required.",
        formData: req.body
      }
    );
  }

  const allowedAudiences = [
    "Everyone",
    "Coaches",
    "Parents",
    "Players"
  ];

  if (
    audience &&
    !allowedAudiences.includes(audience)
  ) {
    return res.status(400).render(
      "announcements/new",
      {
        error: "Please select a valid audience.",
        formData: req.body
      }
    );
  }

  try {
    await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      audience: audience || "Everyone",
      author: req.session.user.id
    });

    res.redirect("/announcements");
  } catch (err) {
    console.error(
      "Announcement creation error:",
      err
    );

    res.status(500).render(
      "announcements/new",
      {
        error: "Unable to create the announcement.",
        formData: req.body
      }
    );
  }
});

module.exports = router;
