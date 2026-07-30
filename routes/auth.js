const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Register Page
router.get("/register", (req, res) => {
    res.render("auth/register", {
        errors: [],
        formData: {}
    });
});

// Show Login Page
router.get("/login", (req, res) => {
    res.render("auth/login", {
        error: null
    });
});

// Process Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.render("auth/login", {
                error: "Invalid email or password"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.render("auth/login", {
                error: "Invalid email or password"
            });
        }

        req.session.user = {
            id: user._id,
            name: user.firstName,
            role: user.role
        };

        res.redirect("/dashboard");

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
// Register User
router.post("/register", async (req, res) => {

    const { firstName, lastName, email, password, confirmPassword } = req.body;

    let errors = [];

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        errors.push({ msg: "Please fill out all fields." });
    }

    if (password.length < 6) {
        errors.push({ msg: "Password must be at least 6 characters." });
    }

    if (password !== confirmPassword) {
        errors.push({ msg: "Passwords do not match." });
    }

    if (errors.length > 0) {
        return res.render("auth/register", {
            errors,
            formData: req.body
        });
    }

    try {

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.render("auth/register", {
                errors: [{ msg: "Email already exists." }],
                formData: req.body
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.redirect("/login");

    } catch (err) {
        console.error(err);
        res.send("Server Error");
    }

    router.get("/login", (req, res) => {
    res.render("auth/login");
});
});

module.exports = router;
