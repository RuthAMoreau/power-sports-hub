const express = require("express");
const mongoose = require("mongoose");

const Event = require("../models/Event");
const Team = require("../models/Team");
const auth = require("../middleware/auth");

const router = express.Router();

// Display all events
router.get("/", auth, async (req, res) => {
  try {
    const events = await Event.find()
      .populate("team", "teamName ageGroup")
      .sort({ date: 1 });

    res.render("events/index", {
      events,
      user: req.session.user
    });
  } catch (err) {
    console.error("Event listing error:", err);
    res.status(500).send("Unable to load the schedule.");
  }
});

// Display add-event form
router.get("/new", auth, async (req, res) => {
  try {
    const teams = await Team.find().sort({ teamName: 1 });

    res.render("events/new", {
      teams,
      error: null,
      formData: {},
      selectedTeamId: req.query.team || ""
    });
  } catch (err) {
    console.error("Event form error:", err);
    res.status(500).send("Unable to load the event form.");
  }
});

// Create event
router.post("/", auth, async (req, res) => {
  const {
    title,
    eventType,
    team,
    date,
    time,
    location,
    opponent,
    notes
  } = req.body;

  try {
    const teams = await Team.find().sort({ teamName: 1 });

    if (!title || !eventType || !team || !date || !time) {
      return res.status(400).render("events/new", {
        teams,
        error: "Title, event type, team, date, and time are required.",
        formData: req.body,
        selectedTeamId: team || ""
      });
    }

    if (!mongoose.Types.ObjectId.isValid(team)) {
      return res.status(400).render("events/new", {
        teams,
        error: "Please select a valid team.",
        formData: req.body,
        selectedTeamId: ""
      });
    }

    const selectedTeam = await Team.findById(team);

    if (!selectedTeam) {
      return res.status(404).render("events/new", {
        teams,
        error: "The selected team could not be found.",
        formData: req.body,
        selectedTeamId: ""
      });
    }

    const eventDate = new Date(`${date}T${time}`);

    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).render("events/new", {
        teams,
        error: "Please enter a valid date and time.",
        formData: req.body,
        selectedTeamId: team
      });
    }

    await Event.create({
      title: title.trim(),
      eventType,
      team,
      date: eventDate,
      location: location ? location.trim() : "",
      opponent: opponent ? opponent.trim() : "",
      notes: notes ? notes.trim() : ""
    });

    res.redirect("/events");
  } catch (err) {
    console.error("Event creation error:", err);

    const teams = await Team.find().sort({ teamName: 1 });

    res.status(500).render("events/new", {
      teams,
      error: "Unable to create the event.",
      formData: req.body,
      selectedTeamId: team || ""
    });
  }
});

module.exports = router;
