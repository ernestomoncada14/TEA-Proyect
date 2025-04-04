
const express = require("express");
const { verificarToken, requierePermiso } = require("../middlewares/auth");
const router = express.Router();

module.exports = (db, io) => {
  const sectorController = require("../controllers/Sector/sectorController")(db, io);
  const usuarioController = require("../controllers/Usuario/UsuarioController")(db, io);

  router.get("/", usuarioController.index);

  router.get("/panel", verificarToken, requierePermiso("ver"), usuarioController.panel);

  router.get("/Sectores", verificarToken, requierePermiso("ver", "crear", "editar", "eliminar"), sectorController.listarSectores);

  router.get("/sector/:id", verificarToken, sectorController.verSector);
  
  router.get("/logout", usuarioController.logout);
  
  return router;
};
