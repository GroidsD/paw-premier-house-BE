const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ error: "Access denied. Admin only." });
  }
};

export default adminMiddleware;
