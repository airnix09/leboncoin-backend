// recover the environment variables
require("dotenv").config();

const express = require("express");
const expressFormidable = require("express-formidable");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(expressFormidable({ multiples: true }));

// connect to the mongodb database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);
const paymentRoutes = require("./routes/payment");
app.use(paymentRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Leboncoin replica - training project");
});

app.all("*", (req, res) => {
  res.status(400).json({ error: { message: "Page not found" } });
});

app.listen(process.env.PORT, () => {
  console.log("Leboncoin server started");
});
