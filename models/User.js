// importation de mongoose pour manipuler mongoDB : ici créer le model en base de données
const mongoose = require("mongoose");

// déclarer mon model (détailler son contenu)
const User = mongoose.model("User", {
  email: { type: String, unique: true },
  salt: String,
  hash: String,
  token: String,
  account: {
    username: { type: String, required: true },
    phone: String
  }
});

// exporter mon model pour qu'il soit utilisable ailleurs (dans les routes par exemple)
module.exports = User;
