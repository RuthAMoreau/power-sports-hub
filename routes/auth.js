const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Show registration page
router.get("/register", (req, res) => {
  res.render("auth/register", {
    errors: [],
    formData: {}
  });
});

// Register user
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword
  } = req.body;

  const errors = [];

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    errors.push({
      msg: "Please fill out all fields."
    });
  }

  if (password && password.length < 6) {
    errors.push({
      msg: "Password must be at least 6 characters."
    });
  }

  if (password !== confirmPassword) {
    errors.push({
      msg: "Passwords do not match."
    });
  }

  if (errors.length > 0) {
    return res.render("auth/register", {
      errors,
      formData: req.body
    });
  }

  try {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.render("auth/register", {
        errors: [
          {
            msg: "Email already exists."
          }
        ],
        formData: req.body
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    res.redirect("/login");
  } catch (err) {
    console.error(
      "Registration error:",
      err
    );

    res.status(500).render("auth/register", {
      errors: [
        {
          msg:
            "Unable to create your account. Please try again."
        }
      ],
      formData: req.body
    });
  }
});

// Show login page
router.get("/login", (req, res) => {
  res.render("auth/login", {
    error: null
  });
});

// Process login
router.post("/login", async (req, res) => {
  const {
    email,
    password
  } = req.body;

  if (!email || !password) {
    return res.render("auth/login", {
      error:
        "Please enter your email and password."
    });
  }

  try {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.render("auth/login", {
        error: "Invalid email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.render("auth/login", {
        error: "Invalid email or password."
      });
    }

    req.session.user = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };

    res.redirect("/dashboard");
  } catch (err) {
    console.error(
      "Login error:",
      err
    );

    res.status(500).render("auth/login", {
      error:
        "Unable to log in. Please try again."
    });
  }
});

// Log out
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(
        "Logout error:",
        err
      );

      return res
        .status(500)
        .send("Unable to log out.");
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

module.exports = router;
