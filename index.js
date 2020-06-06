// on récupère les variables d'environnement
require("dotenv").config();

// on charge les librairires
const express = require("express"); // chargement du paquet pour créer mon serveur
const expressFormidable = require("express-formidable"); // chargement du paquet qui permet de manipuler les posts
const mongoose = require("mongoose"); // chargement du paquet qui permet de manipuler les bases de données
const cors = require("cors"); // Permet au serveur d'accépter des accès entrants (déverouiller l'option sur le serveur)

// on initialise le serveur
const app = express();

// on initialise cors
app.use(cors());

// on déclare l'utilisation de paquet par le serveur
app.use(expressFormidable({ multiples: true })); // { multiples: true } permet l'ajout de plusieurs images

// on se connecte à la base de donnée (qu'on crée également pour l'occasion)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// on récupère les routes user
const userRoutes = require("./routes/user");
// on lance l'utilisation par notre app des routes "user"
app.use(userRoutes);

// on récupère les routes offer
const offerRoutes = require("./routes/offer");
// on déclare l'utilisation par notre app des routes "offer"
app.use(offerRoutes);

// on récupère les routes payment
const paymentRoutes = require("./routes/payment");
// on déclare l'utilisation par notre app des routes "payment"
app.use(paymentRoutes);

// gestion de la route par défaut
app.get("/", (req, res) => {
  res.status(200).send("Bonjour sur Leboncoin like");
});

// on déclare la route all
app.all("*", (req, res) => {
  res.status(400).json({ error: { message: "Page not found" } });
});

// on lance l'écoute du serveur
app.listen(process.env.PORT, () => {
  console.log("Serveur Leboncoin démarré");
});
