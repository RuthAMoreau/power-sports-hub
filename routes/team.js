const express = require("express");
const Team = require("../models/Team");
const auth = require("../middleware/auth");

const router = express.Router();

// Display all teams
router.get("/", auth, async (req, res) => {
  try {
    const teams = await Team.find().populate("coach", "firstName lastName");

    res.render("teams/index", {
      teams,
      user: req.session.user
    });
  } catch (err) {
    console.error("Team listing error:", err);
    res.status(500).send("Unable to load teams.");
  }
});

// Display team creation form
router.get("/new", auth, (req, res) => {
  res.render("teams/new", {
    error: null
  });
});

// Create a team
router.post("/", auth, async (req, res) => {
  const { teamName, ageGroup, season } = req.body;

  if (!teamName || !ageGroup || !season) {
    return res.render("teams/new", {
      error: "Please complete every field."
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
      error: "Unable to create the team."
    });
  }
});

module.exports = router;
