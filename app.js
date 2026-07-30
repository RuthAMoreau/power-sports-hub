const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");
const connectDB = require("./config/database");
require("dotenv").config();
connectDB();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "powersportshubsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// View Engine
app.set("view engine", "ejs");

// Home Route
app.get("/", (req, res) => {
  res.render("index");
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
