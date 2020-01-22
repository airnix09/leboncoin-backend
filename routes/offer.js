// on charge les paquets utilisés pour les routes vers offer
const express = require("express");
const mongoose = require("mongoose");
// on récupère router d'express
const router = express.Router();

// On récupère le model Offer qu'on manipule ici
const Offer = require("../models/Offer");
// On récupère le middleware
const isAuthenticated = require("../middleware/isAuthenticated");

// Déclaration de la route /offer/publish
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // Destructuring
    const reqTitle = req.fields.title;
    const reqDescription = req.fields.description;
    const reqPrice = req.fields.price;

    if (
      reqDescription.length <= 500 &&
      reqTitle.length <= 50 &&
      reqPrice <= 100000
    ) {
      // on crée la requête pour créer le nouvel objet
      const newOffer = new Offer({
        title: reqTitle,
        description: reqDescription,
        price: reqPrice,
        created: new Date(),
        creator: req.currentUser
      });

      // on enregistre en base
      await newOffer.save();

      // on retourne la réponse à l'utilisateur
      res.status(200).json({
        _id: newOffer._id,
        title: newOffer.title,
        description: newOffer.description,
        price: newOffer.price,
        created: newOffer.created,
        creator: {
          account: {
            username: newOffer.creator.account.username,
            phone: newOffer.creator.account.phone
          },
          _id: newOffer.creator._id
        }
      });
    } else {
      res.status(400).json({
        message:
          "Description : 500 caractères maximum, Titre : 50 caractères max, Prix : 100000 max"
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// On exporte les routes (router)
module.exports = router;
