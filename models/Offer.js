// Importation de la librairie mongoose pour manipuler un model
const mongoose = require("mongoose");

// Je déclare mon model Offer
const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  created: Date,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = Offer;
