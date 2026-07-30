function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const userRole = req.session.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).send(
        "You do not have permission to access this page."
      );
    }

    next();
  };
}

module.exports = requireRole;
