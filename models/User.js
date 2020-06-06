const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: { type: String, unique: true },
  salt: String,
  hash: String,
  token: String,
  account: {
    username: { type: String, required: true },
    phone: String,
  },
});

module.exports = User;
