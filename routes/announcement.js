const express = require("express");
const mongoose = require("mongoose");

const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");

const router = express.Router();

// Display announcements with audience filtering and pagination
router.get("/", auth, async (req, res) => {
  try {
    const audience = req.query.audience
      ? req.query.audience.trim()
      : "";

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = 10;

    const query = {};

    if (audience) {
      query.audience = audience;
    }

    const totalAnnouncements =
      await Announcement.countDocuments(query);

    const totalPages = Math.max(
      Math.ceil(totalAnnouncements / limit),
      1
    );

    const currentPage = Math.min(
      page,
      totalPages
    );

    const skip =
      (currentPage - 1) * limit;

    const announcements = await Announcement.find(query)
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render("announcements/index", {
      announcements,
      audience,
      page: currentPage,
      totalPages,
      totalAnnouncements,
      user: req.session.user
    });
  } catch (err) {
    console.error(
      "Announcement listing error:",
      err
    );

    res.status(500).send(
      "Unable to load announcements."
    );
  }
});

// Display new-announcement form
router.get("/new", auth, (req, res) => {
  res.render("announcements/new", {
    error: null,
    formData: {}
  });
});

// Display edit-announcement form
router.get("/:id/edit", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .send("Invalid announcement ID.");
    }

    const announcement =
      await Announcement.findById(req.params.id);

    if (!announcement) {
      return res
        .status(404)
        .send("Announcement not found.");
    }

    res.render("announcements/edit", {
      announcement,
      error: null
    });
  } catch (err) {
    console.error(
      "Announcement edit form error:",
      err
    );

    res.status(500).send(
      "Unable to load the announcement edit form."
    );
  }
});

// Update announcement
router.put("/:id", auth, async (req, res) => {
  const {
    title,
    message,
    audience
  } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .send("Invalid announcement ID.");
    }

    const announcement =
      await Announcement.findById(req.params.id);

    if (!announcement) {
      return res
        .status(404)
        .send("Announcement not found.");
    }

    if (!title || !message || !audience) {
      return res.status(400).render(
        "announcements/edit",
        {
          announcement: {
            ...announcement.toObject(),
            title,
            message,
            audience
          },
          error:
            "Title, message, and audience are required."
        }
      );
    }

    announcement.title = title.trim();
    announcement.message = message.trim();
    announcement.audience = audience;

    await announcement.save();

    res.redirect("/announcements");
  } catch (err) {
    console.error(
      "Announcement update error:",
      err
    );

    res.status(500).send(
      "Unable to update the announcement."
    );
  }
});

// Delete announcement
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .send("Invalid announcement ID.");
    }

    const announcement =
      await Announcement.findById(req.params.id);

    if (!announcement) {
      return res
        .status(404)
        .send("Announcement not found.");
    }

    await Announcement.findByIdAndDelete(
      announcement._id
    );

    res.redirect("/announcements");
  } catch (err) {
    console.error(
      "Announcement deletion error:",
      err
    );

    res.status(500).send(
      "Unable to delete the announcement."
    );
  }
});

// Create announcement
router.post("/", auth, async (req, res) => {
  const {
    title,
    message,
    audience
  } = req.body;

  try {
    if (!title || !message || !audience) {
      return res.status(400).render(
        "announcements/new",
        {
          error:
            "Title, message, and audience are required.",
          formData: req.body
        }
      );
    }

    await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      audience,
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
        error:
          "Unable to create the announcement.",
        formData: req.body
      }
    );
  }
});

module.exports = router;
