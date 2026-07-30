const express = require("express");
const mongoose = require("mongoose");

const Player = require("../models/Player");
const Team = require("../models/Team");
const auth = require("../middleware/auth");

const router = express.Router();

// Display all players
router.get("/", auth, async (req, res) => {
  try {
    const players = await Player.find()
      .populate("team", "teamName ageGroup")
      .sort({ lastName: 1, firstName: 1 });

    res.render("players/index", {
      players,
      user: req.session.user
    });
  } catch (err) {
    console.error("Player listing error:", err);
    res.status(500).send("Unable to load players.");
  }
});

// Display add-player form
router.get("/new", auth, async (req, res) => {
  try {
    const teams = await Team.find().sort({ teamName: 1 });

    res.render("players/new", {
      teams,
      error: null,
      formData: {},
      selectedTeamId: req.query.team || ""
    });
  } catch (err) {
    console.error("Player form error:", err);
    res.status(500).send("Unable to load the player form.");
  }
});

// Create player
router.post("/", auth, async (req, res) => {
  const {
    firstName,
    lastName,
    jerseyNumber,
    position,
    team,
    parentName,
    parentEmail
  } = req.body;

  try {
    const teams = await Team.find().sort({ teamName: 1 });

    if (!firstName || !lastName || !team) {
      return res.status(400).render("players/new", {
        teams,
        error: "First name, last name, and team are required.",
        formData: req.body,
        selectedTeamId: team || ""
      });
    }

    if (!mongoose.Types.ObjectId.isValid(team)) {
      return res.status(400).render("players/new", {
        teams,
        error: "Please select a valid team.",
        formData: req.body,
        selectedTeamId: ""
      });
    }

    const selectedTeam = await Team.findById(team);

    if (!selectedTeam) {
      return res.status(404).render("players/new", {
        teams,
        error: "The selected team could not be found.",
        formData: req.body,
        selectedTeamId: ""
      });
    }

    let parsedJerseyNumber;

    if (jerseyNumber !== "") {
      parsedJerseyNumber = Number(jerseyNumber);

      if (
        !Number.isInteger(parsedJerseyNumber) ||
        parsedJerseyNumber < 0 ||
        parsedJerseyNumber > 99
      ) {
        return res.status(400).render("players/new", {
          teams,
          error: "Jersey number must be a whole number from 0 to 99.",
          formData: req.body,
          selectedTeamId: team
        });
      }
    }

    await Player.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      jerseyNumber: parsedJerseyNumber,
      position: position ? position.trim() : "",
      team,
      parentName: parentName ? parentName.trim() : "",
      parentEmail: parentEmail ? parentEmail.trim().toLowerCase() : ""
    });

    res.redirect(`/teams/${team}`);
  } catch (err) {
    console.error("Player creation error:", err);

    const teams = await Team.find().sort({ teamName: 1 });

    res.status(500).render("players/new", {
      teams,
      error: "Unable to add the player. Please try again.",
      formData: req.body,
      selectedTeamId: team || ""
    });
  }
});

module.exports = router;
