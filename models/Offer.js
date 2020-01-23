// Importation de la librairie mongoose pour manipuler un model
const mongoose = require("mongoose");

// Je déclare mon model Offer
const Offer = mongoose.model("Offer", {
  title: String, // CORRECTION : on peut rajouter minlength, maxlength et required
  description: String,
  price: Number, // CORRECTION : min et max pour number
  created: Date, // CORRECTION : Date.now
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = Offer;
