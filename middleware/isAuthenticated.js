const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const reqToken = req.headers.authorization.replace("Bearer ", "");
    const currentUser = await User.findOne({ token: reqToken });
    if (!currentUser) {
      res.status(400).json({ error: { message: "Unauthorized" } });
    } else {
      req.currentUser = currentUser; // via l'ajout d'une clé dans req
      return next();
    }
  } else {
    res.status(400).json({ error: { message: "Unauthorized" } });
  }
};

module.exports = isAuthenticated;
