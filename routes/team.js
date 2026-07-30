const express = require("express");
const Team = require("../models/Team");
const auth = require("../middleware/auth");

const router = express.Router();

// Show all teams
router.get("/", auth, async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("coach", "firstName lastName")
      .sort({ createdAt: -1 });

    res.render("teams/index", {
      teams,
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
