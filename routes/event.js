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
    const teams = await Team.find().sort({
      teamName: 1
    });

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

// Display edit-event form
router.get("/:id/edit", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid event ID.");
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).send("Event not found.");
    }

    const teams = await Team.find().sort({
      teamName: 1
    });

    res.render("events/edit", {
      event,
      teams,
      error: null
    });
  } catch (err) {
    console.error("Event edit form error:", err);
    res.status(500).send("Unable to load the event edit form.");
  }
});

// Update event
router.put("/:id", auth, async (req, res) => {
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid event ID.");
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).send("Event not found.");
    }

    const teams = await Team.find().sort({
      teamName: 1
    });

    if (!title || !eventType || !team || !date || !time) {
      return res.status(400).render("events/edit", {
        event: {
          ...event.toObject(),
          title,
          eventType,
          team,
          date,
          time,
          location,
          opponent,
          notes
        },
        teams,
        error: "Title, event type, team, date, and time are required."
      });
    }

    if (!mongoose.Types.ObjectId.isValid(team)) {
      return res.status(400).render("events/edit", {
        event: {
          ...event.toObject(),
          title,
          eventType,
          team,
          date,
          time,
          location,
          opponent,
          notes
        },
        teams,
        error: "Please select a valid team."
      });
    }

    const selectedTeam = await Team.findById(team);

    if (!selectedTeam) {
      return res.status(404).render("events/edit", {
        event: {
          ...event.toObject(),
          title,
          eventType,
          team,
          date,
          time,
          location,
          opponent,
          notes
        },
        teams,
        error: "The selected team was not found."
      });
    }

    const eventDate = new Date(`${date}T${time}`);

    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).render("events/edit", {
        event: {
          ...event.toObject(),
          title,
          eventType,
          team,
          date,
          time,
          location,
          opponent,
          notes
        },
        teams,
        error: "Please enter a valid date and time."
      });
    }

    event.title = title.trim();
    event.eventType = eventType;
    event.team = team;
    event.date = eventDate;
    event.location = location ? location.trim() : "";
    event.opponent = opponent ? opponent.trim() : "";
    event.notes = notes ? notes.trim() : "";

    await event.save();

    res.redirect("/events");
  } catch (err) {
    console.error("Event update error:", err);
    res.status(500).send("Unable to update the event.");
  }
});

// Delete event
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).send("Invalid event ID.");
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).send("Event not found.");
    }

    await Event.findByIdAndDelete(event._id);

    res.redirect("/events");
  } catch (err) {
    console.error("Event deletion error:", err);
    res.status(500).send("Unable to delete the event.");
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
    const teams = await Team.find().sort({
      teamName: 1
    });

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

    try {
      const teams = await Team.find().sort({
        teamName: 1
      });

      res.status(500).render("events/new", {
        teams,
        error: "Unable to create the event.",
        formData: req.body,
        selectedTeamId: team || ""
      });
    } catch (teamError) {
      console.error(
        "Unable to reload teams after event creation error:",
        teamError
      );

      res.status(500).send("Unable to create the event.");
    }
  }
});

module.exports = router;
