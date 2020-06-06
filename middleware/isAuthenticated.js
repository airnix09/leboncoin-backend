const User = require("../models/User"); // Car on va chercher dans User si le token envoyé appartient à un user

// paramètre req, res et next fourni par express
const isAuthenticated = async (req, res, next) => {
  // si le champ authorisation du headers n'est pas vide (car si vide on sait déjà qu'il n'y a pas de token transmis)
  if (req.headers.authorization) {
    // je récupère le token transmis par l'utilisateur (via cookie) sans le "Bearer "
    const reqToken = req.headers.authorization.replace("Bearer ", "");
    // Je recherche un utilisateur via ce token
    const currentUser = await User.findOne({ token: reqToken }); // nécessiste la récupération du Model User
    // Si l'utilisateur n'existe pas
    if (!currentUser) {
      // je retourne une erreur à l'utilisateur
      res.status(400).json({ error: { message: "Unauthorized" } });
    } else {
      // Je transmet à la route l'utilisateur trouvé
      req.currentUser = currentUser; // via l'ajout d'une clé dans req
      // Je rend la main à la route appellante
      return next();
    }
  } else {
    // on retourne que l'utilisateur n'est pas autorisé
    res.status(400).json({ error: { message: "Unauthorized" } });
  }
};

module.exports = isAuthenticated;
