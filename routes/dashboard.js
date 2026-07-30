const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, (req, res) => {
  res.render("dashboard/index", {
    user: req.session.user
  });
});

module.exports = router;
