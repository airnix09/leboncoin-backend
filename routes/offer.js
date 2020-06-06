// recover the environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
// retrieve routes from the router module
const router = express.Router();

// configure cloudinary
cloudinary.config({
  cloud_name: "airnix",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// get Offer model
const Offer = require("../models/Offer");
// get Middleware to check if a user is logged in
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    // Destructuring
    const reqTitle = req.fields.title;
    const reqDescription = req.fields.description;
    const reqPrice = req.fields.price;
    const reqPictures = req.files.pictures;

    // sending the offer image to cloudinary
    let picture_url = "";
    await cloudinary.v2.uploader.upload(reqPictures.path, (error, result) => {
      if (error) {
        return res.status(400).json({ message: "Upload Error" });
      } else {
        picture_url = result.secure_url;
      }
    });

    if (
      reqDescription.length <= 500 &&
      reqTitle.length <= 50 &&
      reqPrice <= 100000
    ) {
      // create the new offer
      const newOffer = new Offer({
        title: reqTitle,
        description: reqDescription,
        price: reqPrice,
        pictures: [picture_url],
        created: new Date(),
        creator: req.currentUser,
      });
      await newOffer.save();

      // return the result to the API user
      res.status(200).json({
        _id: newOffer._id,
        title: newOffer.title,
        description: newOffer.description,
        price: newOffer.price,
        pictures: newOffer.pictures,
        created: newOffer.created,
        creator: {
          account: {
            username: newOffer.creator.account.username,
            phone: newOffer.creator.account.phone,
          },
          _id: newOffer.creator._id,
        },
      });
    } else {
      res.status(400).json({
        message:
          "Description : 500 caractères maximum, Titre : 50 caractères max, Prix : 100000 max",
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// function that prepares the mongodb filter
const createFilter = (req) => {
  // Destructuring
  const reqTitle = req.query.title;
  const reqPriceMax = req.query.priceMax;
  const reqPriceMin = req.query.priceMin;

  // object that will be used in mongodb research
  let filter = {};

  // We make filter evolve according to what req contains
  if (reqTitle) {
    filter.title = new RegExp(reqTitle, "i");
  }
  if (reqPriceMin || reqPriceMax) {
    filter.price = {};
  }
  if (reqPriceMax) {
    filter.price.$lte = reqPriceMax;
  }
  if (reqPriceMin) {
    filter.price.$gte = reqPriceMin;
  }

  return filter;
};

router.get("/offer/with-count", async (req, res) => {
  try {
    // Destructuring
    const reqPage = req.query.page; // pas de page demandé par le frontend mais skip et limit
    const reqSkip = Number(req.query.skip); // on transforme en chiffre la valeur reçue qui est lui est reçu en string
    const reqLimit = Number(req.query.limit);
    const reqSort = req.query.sort;

    // use of the function that creates the object used in mongodb search
    const filter = createFilter(req);

    // prepare the research
    const offers = Offer.find(filter)
      .populate("creator", "account email")
      .select("-__v");

    // order or filter the result according to the API request
    if (reqPage) {
      const limitePage = 10;
      offers.limit(limitePage).skip(limitePage * (reqPage - 1));
    }
    if (reqSkip !== NaN && reqLimit !== NaN) {
      offers.limit(reqLimit).skip(reqSkip);
    }
    if (reqSort) {
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

    // launch the research
    const search = await offers;

    // launch a second search to obtain the total number of offers in the database
    const allOffers = Offer.find();
    const searchCount = await allOffers;

    // return the result to the API user
    res.status(200).json({
      count: searchCount.length,
      offers: search,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    // launch the offer research using his ID
    const offer = await Offer.findById(req.params.id)
      .populate("creator", "account")
      .select("-__v");

    // return the result to the API user
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
