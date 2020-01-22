// on charge les librairires
const express = require("express"); // chargement du paquet pour créer mon serveur
const expressFormidable = require("express-formidable"); // chargement du paquet qui permet de manipuler les posts
const mongoose = require("mongoose"); // chargement du paquet qui permet de manipuler les bases de données

// on initialise le serveur
const app = express();

// on déclare l'utilisation de paquet par le serveur
app.use(expressFormidable());

// on se connecte à la base de donnée (qu'on crée également pour l'occasion)
mongoose.connect("mongodb://localhost/leboncoin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

// on récupère les routes user
const userRoutes = require("./routes/user");
// on lance l'utilisation par notre app
app.use(userRoutes);
// on récupère les routes
const userOffers = require("./routes/offer");
// on déclare des
app.use(userOffers);

// on déclare la route all
app.all("*", (req, res) => {
  res.statuts(400).json({ error: { message: "Page not found" } });
});

// on lance l'écoute du serveur
app.listen(3000, () => {
  console.log("Serveur Leboncoin démarré");
});
