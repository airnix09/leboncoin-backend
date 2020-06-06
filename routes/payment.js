require("dotenv").config();
const express = require("express");
const router = express.Router();
const createStripe = require("stripe");
const isAuthenticated = require("../middleware/isAuthenticated");

// stripe configuration
const stripe = createStripe(process.env.STRIPE_API_SECRET);

router.post("/pay", isAuthenticated, async (req, res) => {
  // destructuring
  const reqToken = req.fields.token;
  const reqAmount = Number(req.fields.amount);
  const reqDescription = req.fields.description;

  try {
    // send payment to strip
    let { status } = await stripe.charges.create({
      amount: reqAmount * 100,
      currency: "eur",
      description: reqDescription,
      source: req.fields.token,
    });
    res.json({ status });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
