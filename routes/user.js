// On charge les paquets utilisés dans la déclaration des routes
const express = require("express");
const uid2 = require("uid2"); // chargement du paquet qui permet de créer n caractères aléatoire dans une chaine de caractère. n en paramètre
const SHA256 = require("crypto-js/sha256"); // chargement du paquet qui permet de créer un hash à partir de texte en paramètre
const encBase64 = require("crypto-js/enc-base64"); // chargement du paquet qui permet de transformer un objet hash en chaine de caractère

// On dit au serveur que les routes seront déclarer avec router (qui est exporté après pour être utilisé dans l'index.js)
const router = express.Router();

// On récupère le model User pour lancer nos requêtes en base
const User = require("../models/User");

// On déclare les routes (avec router mais plus avec app)
// Déclaration de la route sign_up
router.post("/user/sign_up", async (req, res) => {
  try {
    // Destructuring
    const reqEmail = req.fields.email;
    const reqUsername = req.fields.username;
    const reqPhone = req.fields.phone;
    const reqPassword = req.fields.password;

    // on vérifie si le mail existe déjà
    const myUser = await User.findOne({ email: reqEmail });
    if (myUser) {
      // on retourne à l'utilisateur que l'email est déjà utilisé
      res.status(400).json({ error: { message: "email already used" } });
    } else if (!reqUsername || !reqPassword || !reqEmail) {
      // on retourne à l'utilisateur que le username est obligatoire. CORRECTION : idem pour le mot de pase
      res.status(400).json({
        error: { message: "username, password and email is mandatory" }
      });
    } else {
      // Je crée le salt : chaine de caractères aléatoires de n longueur
      const salt = uid2(64);
      // console.log("salt:" + salt);

      // Je crée le hash256 avec le mot de passe de l'utilisateur et le slat en paramètre
      const hash = SHA256(reqPassword + salt).toString(encBase64);
      // console.log("hash:" + hash);

      // Je crée le token
      const token = uid2(64);
      // console.log(token);

      // Je crée un nouvel utilisateur via le model
      const newUser = new User({
        email: reqEmail,
        salt: salt,
        hash: hash,
        token: token,
        account: {
          username: reqUsername,
          phone: reqPhone
        }
      });

      // Je sauvegarde en base
      await newUser.save();

      // Je réponds à l'utilisateur avec _id, token, account (un objet)
      res.status(200).json({
        _id: newUser._id,
        token: newUser.token,
        account: newUser.account
      });
    }
  } catch (error) {
    /* On aurait pu géré dans le catch mais le but ultime est d'éviter de tomber dans le catch
    if (error.code === 11000) {
      res.status(400).json({ message: "email déjà existante" });
    } else {
      res.status(400).json({ message: error.message });
    }
    */
    res.status(400).json({ message: error.message });
  }
});

// Déclaration de la route log_in
router.post("/user/log_in", async (req, res) => {
  try {
    // Destructuring
    const reqEmail = req.fields.email;
    const reqPassword = req.fields.password;

    // on récupère l'utilisateur demandé (via son email)
    const reqUser = await User.findOne({ email: reqEmail });

    // s'il ne retourne rien on dit à l'utilisateur qu'il n'y a pas de compte avec ce mail
    if (!reqUser) {
      res.status(400).json({ error: { message: "Account not found" } });
    } else {
      // On hash le mot de passe entré avec le salt
      const hashchecked = SHA256(reqPassword + reqUser.salt).toString(
        encBase64
      );
      // console.log("sended:" + hashchecked);
      // console.log("inside mongo:" + reqUser.hash);

      // on compare le resultat avec le hash en base
      if (hashchecked !== reqUser.hash) {
        // si Non on retoune que le mot de passe et/ou (ne pas donner plus d'info : en reste vague)
        res.status(400).json({ error: { message: "Wrong email or password" } });
      } else {
        // si OK on retourne l'id, le token, l'account
        res.status(200).json({
          _id: reqUser._id,
          token: reqUser.token,
          account: reqUser.account
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// On exporte les routes (router)
module.exports = router;
