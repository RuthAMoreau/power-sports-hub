const express = require("express");
const mongoose = require("mongoose");

const Announcement = require("../models/Announcement");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

// Display announcements with search, filtering, sorting, and pagination
router.get("/", auth, async (req, res) => {
  try {
    const search = req.query.search
      ? req.query.search.trim()
      : "";

    const audience = req.query.audience
      ? req.query.audience.trim()
      : "";

    const allowedSortOptions = [
      "newest",
      "oldest",
      "title-asc",
      "title-desc"
    ];

    const requestedSort = req.query.sort
      ? req.query.sort.trim()
      : "newest";

    const sort = allowedSortOptions.includes(requestedSort)
      ? requestedSort
      : "newest";

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = 10;

    const query = {};

    if (audience) {
      query.audience = audience;
    }

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i"
          }
        },
        {
          message: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    let sortOption = {
      createdAt: -1
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1
      };
    } else if (sort === "title-asc") {
      sortOption = {
        title: 1
      };
    } else if (sort === "title-desc") {
      sortOption = {
        title: -1
      };
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
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.render("announcements/index", {
      announcements,
      search,
      audience,
      sort,
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
router.get(
  "/new",
  auth,
  requireRole("admin", "coach"),
  (req, res) => {
    res.render("announcements/new", {
      error: null,
      formData: {}
    });
  }
);

// Display edit-announcement form
router.get(
  "/:id/edit",
  auth,
  requireRole("admin", "coach"),
  async (req, res) => {
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
  }
);

// Update announcement
router.put(
  "/:id",
  auth,
  requireRole("admin", "coach"),
  async (req, res) => {
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
  }
);

// Delete announcement
router.delete(
  "/:id",
  auth,
  requireRole("admin"),
  async (req, res) => {
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
  }
);

// Create announcement
router.post(
  "/",
  auth,
  requireRole("admin", "coach"),
  async (req, res) => {
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
  }
);

module.exports = router;
