const view = require("../utils/view");
const express = require("express");
const { verificarToken, requierePermiso } = require("../middlewares/auth");
const router = express.Router();

module.exports = (db, io) => {

  router.get("/", async (req, res) => {
    res.sendFile(view("index"));
  });

  router.get("/panel", verificarToken, requierePermiso("ver"), async (req, res) => {
    res.sendFile(view("panel"));
  });

  router.get("/logout", (req, res) => {
    res.clearCookie("token");
    // res.json({ status: "ok", message: "Sesión cerrada" });
    res.redirect("/");
  });
  

  return router;
};
