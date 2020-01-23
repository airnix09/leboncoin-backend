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
      // on crée la requête pour créer le nouvel objet qu'on passe à Offer
      // on peut délarer ailleurs l'objet et le passer en paramètre d'Offer
      const newOffer = new Offer({
        title: reqTitle,
        description: reqDescription,
        price: reqPrice,
        created: new Date(), // Si date par défaut now en base, il n'y a pas besoin de l'envoyer
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
          // on peut direct faire = account : newOffer.creator.account
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

// Déclaration fonction qui retourne un objet servant à filter les résultats d'un find
const createFilter = req => {
  // Destructuring
  const reqTitle = req.query.title;
  const reqPriceMax = req.query.priceMax;
  const reqPriceMin = req.query.priceMin;

  // Objet manipulé qui sera utilisé dans find
  let filter = {};

  // On fait évoluer filter en fonction de ce que contient req
  // si le titre est demandé
  if (reqTitle) {
    filter.title = new RegExp(reqTitle, "i"); // RegExp permet d'envoyer juste un bout (play) et "i" le rend insensible à la casse
  }
  // Si une limit min ou max de prix est demandé
  if (reqPriceMin || reqPriceMax) {
    // je défini une clé price avec un objet vide
    filter.price = {};
  }
  if (reqPriceMax) {
    filter.price.$lte = reqPriceMax;
  }
  if (reqPriceMin) {
    filter.price.$gte = reqPriceMin;
  }

  // on retourne l'objet filter
  return filter;
};

// Déclaration de la route /offer/with-count
router.get("/offer/with-count", async (req, res) => {
  try {
    // Destructuring
    const reqPage = req.query.page;
    const reqSort = req.query.sort;

    // on va mettre la requête (req) dans une fonction qui lui rajoutera dans un objet l'ensemble des query de filtre qu'il aura vu.
    // le résultat sera transmis à find. find peut faire un filtre de sa recherche (sur le titre, le prix) avec un paramètre objet
    const filter = createFilter(req);

    // on initie la requête de recherche
    const offers = Offer.find(filter)
      .populate("creator", "account email") // on filtre avec un 2ème argument le populate (affiche _id toujours)
      .select("-__v"); // on enlève dans le retour le __v (on précisant - le champ à enlever : directement derrière)

    // si on demande de paginer (reqPage n'est pas vide)
    if (reqPage) {
      // on rajoute la pagination (on fixe ici le nombre de réponse par page)
      const limitePage = 3;
      // on affiche un nombre limité de page (avec .limit) et on affiche à partir d'un certain nombre (avec .skip)
      // on enlève à chaque fois 0, 3, 6, 9 (multiple de la limite et de la page décalé de 1)
      offers.limit(limitePage).skip(limitePage * (reqPage - 1));
    }

    // si on demande de trier (prix croissant/décroissant ou date croissant/décroissant)
    if (reqSort) {
      // Si on demande par prix-descendant
      if (reqSort === "price-desc") {
        offers.sort({ price: -1 });
      }
      if (reqSort === "price-asc") {
        offers.sort({ price: 1 });
      }
      if (reqSort === "date-desc") {
        offers.sort({ created: -1 });
      }
      if (reqSort === "date-asc") {
        offers.sort({ created: 1 });
      }
    }

    // on lance la requête : "await offers" lance la requête ( c'est comme si c'était le lancement  d'une fonction).
    // il faut stocker son résultat dans une variable.
    const search = await offers;

    // on retourne à l'utilisateur le résultat de la recherche
    res.status(200).json({
      count: search.length,
      offers: search
    });
  } catch (error) {
    console.log({ message: error.message });
  }
});

// Déclaration de la route /offer
router.get("/offer/:id", async (req, res) => {
  try {
    // on lance la recherche de l'id de l'objet demandé
    const offer = await Offer.findById(req.params.id)
      .populate("creator", "account")
      .select("-__v");

    // on affiche l'objet à l'utilisateur
    res.status(400).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// On exporte les routes (router)
module.exports = router;
