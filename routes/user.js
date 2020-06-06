const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// retrieve routes from the router module
const router = express.Router();

// get User model
const User = require("../models/User");

router.post("/user/sign_up", async (req, res) => {
  try {
    // Destructuring
    const reqEmail = req.fields.email;
    const reqUsername = req.fields.username;
    const reqPhone = req.fields.phone;
    const reqPassword = req.fields.password;

    // check if email already exists
    const myUser = await User.findOne({ email: reqEmail });
    if (myUser) {
      // return to API user that email is already used
      res.status(400).json({ error: { message: "email already used" } });
    } else if (!reqUsername || !reqPassword || !reqEmail) {
      // return to API user that username, password and email are mandatory
      res.status(400).json({
        error: { message: "username, password and email is mandatory" },
      });
    } else {
      // user hash creation
      const salt = uid2(64);
      const hash = SHA256(reqPassword + salt).toString(encBase64);

      // user token creation
      const token = uid2(64);

      // user creation in database
      const newUser = new User({
        email: reqEmail,
        salt: salt,
        hash: hash,
        token: token,
        account: {
          username: reqUsername,
          phone: reqPhone,
        },
      });
      await newUser.save();

      // return the result to the API user
      res.status(200).json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account,
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/user/log_in", async (req, res) => {
  try {
    // Destructuring
    const reqEmail = req.fields.email;
    const reqPassword = req.fields.password;

    // check the email address of the user who wants to connect
    const reqUser = await User.findOne({ email: reqEmail });

    // if not found
    if (!reqUser) {
      res.status(400).json({ error: { message: "Account not found" } });
    } else {
      // hash the password sent to check if it is identical to the hash in the database
      const hashchecked = SHA256(reqPassword + reqUser.salt).toString(
        encBase64
      );
      // if not the same
      if (hashchecked !== reqUser.hash) {
        res.status(400).json({ error: { message: "Wrong email or password" } });
      } else {
        // return the result to the API user if OK
        res.status(200).json({
          _id: reqUser._id,
          token: reqUser.token,
          account: reqUser.account,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
