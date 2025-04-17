
const express = require("express");
const { verificarToken, requierePermiso } = require("../middlewares/auth");
const router = express.Router();

module.exports = (db, io) => {
  const sectorController = require("../controllers/Sector/sectorController")(db, io);
  const usuarioController = require("../controllers/Usuario/UsuarioController")(db);

  router.get("/", usuarioController.index);

  router.get("/crear_usuario", usuarioController.vistaCrearUsuario);

  router.get("/panel", verificarToken, requierePermiso("crear", "editar", "eliminar"), usuarioController.panel);

  router.get("/Sectores", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.listarSectores);

  router.get("/sector/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.verSector);
  
  router.get("/logout", usuarioController.logout);

  router.get("/habitante/:id", verificarToken, requierePermiso("ver"), usuarioController.verHabitante);
  
  return router;
};
