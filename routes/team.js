const express = require("express");
const mongoose = require("mongoose");

const Team = require("../models/Team");
const Player = require("../models/Player");
const Event = require("../models/Event");
const auth = require("../middleware/auth");

const router = express.Router();

// Show all teams with search and pagination
router.get("/", auth, async (req, res) => {
  try {
    const search = req.query.search
      ? req.query.search.trim()
      : "";

    const page = Math.max(
      parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = 10;

    const query = {};

    if (search) {
      query.teamName = {
        $regex: search,
        $options: "i"
      };
    }

    const totalTeams = await Team.countDocuments(query);

    const totalPages = Math.max(
      Math.ceil(totalTeams / limit),
      1
    );

    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;

    const teams = await Team.find(query)
      .populate("coach", "firstName lastName")
      .sort({
        ageGroup: 1,
        teamName: 1
      })
      .skip(skip)
      .limit(limit);

    res.render("teams/index", {
      teams,
      search,
      page: currentPage,
      totalPages,
      totalTeams,
      user: req.session.user
    });
  } catch (err) {
    console.error("Team listing error:", err);

    res.status(500).send(
      `Unable to load teams: ${err.message}`
    );
  }
});

// Show create-team form
router.get("/new", auth, (req, res) => {
  res.render("teams/new", {
    error: null,
    formData: {}
  });
});

// Show edit-team form
router.get("/:id/edit", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .send(
          `Invalid team ID received: ${req.params.id}`
        );
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).send("Team not found.");
    }

    res.render("teams/edit", {
      team,
      error: null
    });
  } catch (err) {
    console.error("Team edit form error:", err);

    res.status(500).send(
      "Unable to load the edit form."
    );
  }
});

// Update team
router.put("/:id", auth, async (req, res) => {
  const { teamName, ageGroup, season } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid team ID.");
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).send("Team not found.");
    }

    if (!teamName || !ageGroup || !season) {
      return res.status(400).render("teams/edit", {
        team: {
          ...team.toObject(),
          teamName,
          ageGroup,
          season
        },
        error:
          "Team name, age group, and season are required."
      });
    }

    team.teamName = teamName.trim();
    team.ageGroup = ageGroup.trim();
    team.season = season.trim();

    await team.save();

    res.redirect(`/teams/${team._id}`);
  } catch (err) {
    console.error("Team update error:", err);

    res.status(500).send(
      "Unable to update the team."
    );
  }
});

// Delete team and its related players and events
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid team ID.");
    }

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).send("Team not found.");
    }

    await Player.deleteMany({
      team: team._id
    });

    await Event.deleteMany({
      team: team._id
    });

    await Team.findByIdAndDelete(team._id);

    res.redirect("/teams");
  } catch (err) {
    console.error("Team deletion error:", err);

    res.status(500).send(
      "Unable to delete the team."
    );
  }
});

// Display one team and its roster
router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid team ID.");
    }

    const team = await Team.findById(
      req.params.id
    ).populate(
      "coach",
      "firstName lastName"
    );

    if (!team) {
      return res.status(404).send("Team not found.");
    }

    const players = await Player.find({
      team: team._id
    }).sort({
      lastName: 1,
      firstName: 1
    });

    res.render("teams/show", {
      team,
      players,
      user: req.session.user
    });
  } catch (err) {
    console.error("Team detail error:", err);

    res.status(500).send(
      "Unable to load team details."
    );
  }
});

// Create team
router.post("/", auth, async (req, res) => {
  const { teamName, ageGroup, season } = req.body;

  if (!teamName || !ageGroup || !season) {
    return res.status(400).render("teams/new", {
      error: "Please complete every field.",
      formData: req.body
    });
  }

  try {
    await Team.create({
      teamName: teamName.trim(),
      ageGroup: ageGroup.trim(),
      season: season.trim(),
      coach: req.session.user.id
    });

    res.redirect("/teams");
  } catch (err) {
    console.error("Team creation error:", err);

    res.status(500).render("teams/new", {
      error: "Unable to create the team.",
      formData: req.body
    });
  }
});

module.exports = router;
