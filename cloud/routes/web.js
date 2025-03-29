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

  router.get("/Sectores", verificarToken, requierePermiso("ver", "crear", "editar", "eliminar"), async (req, res) => {
    res.sendFile(view("ver_sectores"));
  });

  router.get("/sector/:id", verificarToken, async (req, res) => {
    try {
      const SectorId = req.params.id;
  
      res.render("sector", { SectorId });
    } catch (err) {
      console.error("Error en ruta /sector/:id", err);
      res.status(500).send("Error interno del servidor");
    }
  });
  
  

  router.get("/logout", (req, res) => {
    res.clearCookie("token");
    // res.json({ status: "ok", message: "Sesión cerrada" });
    res.redirect("/");
  });
  

  return router;
};
