// 1. LOAD ENVIRONMENT VARIABLES FIRST
require("dotenv").config();

// 2. IMPORT PACKAGES
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

// Import Routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const teamRoutes = require("./routes/team");

// 3. IMPORT LOCAL FILES
const connectDB = require("./config/database");

// 4. INITIALIZE APP
const app = express();

// 5. CONNECT TO DATABASE
// Note: You had two different database connection methods competing here. 
// We are using the explicit one that utilizes process.env.MONGO_URI.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database Connection Error:', err));

// 6. MIDDLEWARE
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

app.use("/", authRoutes);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "powersportshubsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// Register Routes
app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/teams", teamRoutes);

// View Engine
app.set("view engine", "ejs");

// Home Route
app.get("/", (req, res) => {
  res.render("index");
});

// 7. VIEW ENGINE
app.set("view engine", "ejs");

// 8. ROUTES
app.get("/", (req, res) => {
  res.render("index");
});

// 9. START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
