const express = require("express");
const mongoose = require("mongoose");

const Player = require("../models/Player");
const Team = require("../models/Team");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/role");

const router = express.Router();

// Display all players with search and pagination
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
      query.$or = [
        {
          firstName: {
            $regex: search,
            $options: "i"
          }
        },
        {
          lastName: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    const totalPlayers =
      await Player.countDocuments(query);

    const totalPages = Math.max(
      Math.ceil(totalPlayers / limit),
      1
    );

    const currentPage = Math.min(
      page,
      totalPages
    );

    const currentSkip =
      (currentPage - 1) * limit;

    const players = await Player.find(query)
      .populate("team", "teamName ageGroup")
      .sort({
        lastName: 1,
        firstName: 1
      })
      .skip(currentSkip)
      .limit(limit);

    res.render("players/index", {
      players,
      search,
      page: currentPage,
      totalPages,
      totalPlayers,
      user: req.session.user
    });
  } catch (err) {
    console.error(
      "Player listing error:",
      err
    );

    res.status(500).send(
      "Unable to load players."
    );
  }
});

// Display add-player form
router.get(
  "/new",
  auth,
  requireRole("admin", "coach"),
  async (req, res) => {
    try {
      const teams = await Team.find().sort({
        teamName: 1
      });

      res.render("players/new", {
        teams,
        error: null,
        formData: {},
        selectedTeamId: req.query.team || ""
      });
    } catch (err) {
      console.error(
        "Player form error:",
        err
      );

      res.status(500).send(
        "Unable to load the player form."
      );
    }
  }
);

// Display edit-player form
router.get(
  "/:id/edit",
  auth,
  requireRole("admin", "coach"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
          .status(400)
          .send("Invalid player ID.");
      }

      const player =
        await Player.findById(req.params.id);

      if (!player) {
        return res
          .status(404)
          .send("Player not found.");
      }

      const teams = await Team.find().sort({
        teamName: 1
      });

      res.render("players/edit", {
        player,
        teams,
        error: null
      });
    } catch (err) {
      console.error(
        "Player edit form error:",
        err
      );

      res.status(500).send(
        "Unable to load the player edit form."
      );
    }
  }
);

// Update player
router.put(
  "/:id",
  auth,
  requireRole("admin", "coach"),
  async (req, res) => {
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
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
          .status(400)
          .send("Invalid player ID.");
      }

      const player =
        await Player.findById(req.params.id);

      if (!player) {
        return res
          .status(404)
          .send("Player not found.");
      }

      const teams = await Team.find().sort({
        teamName: 1
      });

      if (!firstName || !lastName || !team) {
        return res.status(400).render(
          "players/edit",
          {
            player: {
              ...player.toObject(),
              firstName,
              lastName,
              jerseyNumber,
              position,
              team,
              parentName,
              parentEmail
            },
            teams,
            error:
              "First name, last name, and team are required."
          }
        );
      }

      if (!mongoose.Types.ObjectId.isValid(team)) {
        return res.status(400).render(
          "players/edit",
          {
            player: {
              ...player.toObject(),
              firstName,
              lastName,
              jerseyNumber,
              position,
              team,
              parentName,
              parentEmail
            },
            teams,
            error:
              "Please select a valid team."
          }
        );
      }

      const selectedTeam =
        await Team.findById(team);

      if (!selectedTeam) {
        return res.status(404).render(
          "players/edit",
          {
            player: {
              ...player.toObject(),
              firstName,
              lastName,
              jerseyNumber,
              position,
              team,
              parentName,
              parentEmail
            },
            teams,
            error:
              "The selected team was not found."
          }
        );
      }

      let parsedJerseyNumber = null;

      if (
        jerseyNumber !== "" &&
        jerseyNumber !== undefined
      ) {
        parsedJerseyNumber =
          Number(jerseyNumber);

        if (
          !Number.isInteger(parsedJerseyNumber) ||
          parsedJerseyNumber < 0 ||
          parsedJerseyNumber > 99
        ) {
          return res.status(400).render(
            "players/edit",
            {
              player: {
                ...player.toObject(),
                firstName,
                lastName,
                jerseyNumber,
                position,
                team,
                parentName,
                parentEmail
              },
              teams,
              error:
                "Jersey number must be a whole number from 0 through 99."
            }
          );
        }
      }

      player.firstName = firstName.trim();
      player.lastName = lastName.trim();
      player.jerseyNumber = parsedJerseyNumber;
      player.position = position
        ? position.trim()
        : "";
      player.team = team;
      player.parentName = parentName
        ? parentName.trim()
        : "";
      player.parentEmail = parentEmail
        ? parentEmail.trim().toLowerCase()
        : "";

      await player.save();

      res.redirect(`/teams/${team}`);
    } catch (err) {
      console.error(
        "Player update error:",
        err
      );

      res.status(500).send(
        "Unable to update the player."
      );
    }
  }
);

// Delete player
router.delete(
  "/:id",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res
          .status(400)
          .send("Invalid player ID.");
      }

      const player =
        await Player.findById(req.params.id);

      if (!player) {
        return res
          .status(404)
          .send("Player not found.");
      }

      const teamId = player.team;

      await Player.findByIdAndDelete(
        player._id
      );

      res.redirect(`/teams/${teamId}`);
    } catch (err) {
      console.error(
        "Player deletion error:",
        err
      );

      res.status(500).send(
        "Unable to delete the player."
      );
    }
  }
);

// Create player
router.post(
  "/",
  auth,
  requireRole("admin", "coach"),
  async (req, res) => {
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
      const teams = await Team.find().sort({
        teamName: 1
      });

      if (!firstName || !lastName || !team) {
        return res.status(400).render(
          "players/new",
          {
            teams,
            error:
              "First name, last name, and team are required.",
            formData: req.body,
            selectedTeamId: team || ""
          }
        );
      }

      if (!mongoose.Types.ObjectId.isValid(team)) {
        return res.status(400).render(
          "players/new",
          {
            teams,
            error:
              "Please select a valid team.",
            formData: req.body,
            selectedTeamId: ""
          }
        );
      }

      const selectedTeam =
        await Team.findById(team);

      if (!selectedTeam) {
        return res.status(404).render(
          "players/new",
          {
            teams,
            error:
              "The selected team could not be found.",
            formData: req.body,
            selectedTeamId: ""
          }
        );
      }

      let parsedJerseyNumber = null;

      if (
        jerseyNumber !== "" &&
        jerseyNumber !== undefined
      ) {
        parsedJerseyNumber =
          Number(jerseyNumber);

        if (
          !Number.isInteger(parsedJerseyNumber) ||
          parsedJerseyNumber < 0 ||
          parsedJerseyNumber > 99
        ) {
          return res.status(400).render(
            "players/new",
            {
              teams,
              error:
                "Jersey number must be a whole number from 0 through 99.",
              formData: req.body,
              selectedTeamId: team
            }
          );
        }
      }

      await Player.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jerseyNumber: parsedJerseyNumber,
        position: position
          ? position.trim()
          : "",
        team,
        parentName: parentName
          ? parentName.trim()
          : "",
        parentEmail: parentEmail
          ? parentEmail.trim().toLowerCase()
          : ""
      });

      res.redirect(`/teams/${team}`);
    } catch (err) {
      console.error(
        "Player creation error:",
        err
      );

      try {
        const teams = await Team.find().sort({
          teamName: 1
        });

        res.status(500).render(
          "players/new",
          {
            teams,
            error:
              "Unable to add the player. Please try again.",
            formData: req.body,
            selectedTeamId: team || ""
          }
        );
      } catch (teamError) {
        console.error(
          "Unable to reload teams after player creation error:",
          teamError
        );

        res.status(500).send(
          "Unable to add the player."
        );
      }
    }
  }
);

module.exports = router;
