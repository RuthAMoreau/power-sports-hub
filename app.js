// Load environment variables first
require("dotenv").config();

// Import packages
const express = require("express");
const session = require("express-session");
const methodOverride = require("method-override");
const path = require("path");

// Import database connection
const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const teamRoutes = require("./routes/team");
const playerRoutes = require("./routes/player");
const eventRoutes = require("./routes/event");
const announcementRoutes = require("./routes/announcement");

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// View engine
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Sessions
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "powersportshubsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Application routes
app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/teams", teamRoutes);
app.use("/players", playerRoutes);
app.use("/events", eventRoutes);
app.use("/announcements", announcementRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).send("Something went wrong.");
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
