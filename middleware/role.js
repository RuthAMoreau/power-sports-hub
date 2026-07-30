function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const userRole = req.session.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).render("errors/403", {
        user: req.session.user
    });
    }

    next();
  };
}

module.exports = requireRole;
