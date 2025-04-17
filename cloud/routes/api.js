const express = require("express");

const { verificarToken, requierePermiso } = require("../middlewares/auth");
const { json } = require("sequelize");
// const { DiaProgramacion } = require("../models");
// const { where } = require("sequelize");


module.exports = (db, io) => {

  const usuarioController = require("../controllers/Usuario/UsuarioController")(db);
  const sectorController = require("../controllers/Sector/sectorController")(db, io);
  const diaController = require("../controllers/Programacion/diaController")(db, io);
  const programacionHorarioController = require("../controllers/Programacion/programacionHorarioController")(db, io);
  const placaController = require("../controllers/Sector/placaController")(db, io);
  const valvulaController = require("../controllers/Valvula/valvulaController")(db, io);
  const historialValvulaController = require("../controllers/Valvula/historialValvulaController")(db, io);
  const historialSensorFlujoController = require("../controllers/Sensor/historialFlujoController")(db, io);

  const router = express.Router();

  // ----------------------------------------------------------------Hola Mundo---------------------------------------------------------------------------------------

  // Ruta de prueba para ver usuarios
  router.get("/prueba", usuarioController.prueba);

  // ----------------------------------------------------------------informacion del user---------------------------------------------------------------------------

  // Ruta la informacion del usuario logueado
  router.get("/userinfo", verificarToken, requierePermiso("ver", "api"), usuarioController.userInfo);

  // ----------------------------------------------------------------Crear de usuarios--------------------------------------------------------------------------------
  router.post("/crear_usuario", usuarioController.crearUsuario);

  // ----------------------------------------------------------------LOGIN-----------------------------------------------------------------------------------------
  
  // Login
  router.post("/login", usuarioController.login);

  // Login cliente
  router.post("/login-client", usuarioController.loginClient);

  // ----------------------------------------------------------------CRUDS-----------------------------------------------------------------------------------------
  // -----------------------------CRUD para dia_semana
  // Leer
  router.get("/dias", verificarToken, requierePermiso("crear", "editar", "eliminar"), diaController.dias);

  // -----------------------------CRUD para Sector
  // Leer
  router.get("/sectores", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.sectores);

  // -----------------------------CRUD para ProgramacionHorario

  // Leer todas las programaciones
  router.get("/programaciones", verificarToken, requierePermiso("crear", "editar", "eliminar"), programacionHorarioController.programaciones);

  // Crear nueva programación
  router.post("/programaciones", verificarToken, requierePermiso("crear", "editar", "eliminar"), programacionHorarioController.crearProgramacion);

  // Leer una programación por ID
  router.get("/programaciones/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), programacionHorarioController.programacionPorId);

  // leer programaciones por sector
  router.get("/programaciones/sector/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), programacionHorarioController.programacionPorSector);

  // Actualizar programación
  router.put("/programaciones/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), programacionHorarioController.actualizarProgramacion);

  // Cambiar estado de programación
  router.post("/programaciones/:id/estado", verificarToken, programacionHorarioController.cambiarEstado);


  // Eliminar programación
  router.delete("/programaciones/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), programacionHorarioController.eliminarProgramacion);


  // -----------------------------CRUD para Sector

  // Leer
  router.get("/sectores", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.sectores);
  router.get("/sectores_usuario", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.sectores);

  // Crear
  router.post("/sectores", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.crearSector);

  // Leer uno
  router.get("/sectores/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.leerUno);
  router.get("/sectores/horarios/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.obtenerHorariosPorSector);

  // Actualizar
  router.put("/sectores/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.actualizarSector);

  // eliminar
  router.delete("/sectores/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), sectorController.eliminarSector);

  // -----------------------------CRUD de Placa
  // leer por placa
  router.get("/placas/:SectorId", verificarToken, requierePermiso("crear", "editar", "eliminar"), placaController.leerPlacaPorSector);


  // -----------------------------CRUD de valvula
  // actualizar estado de valvula
  router.post("/valvulas/:id/estado", verificarToken, valvulaController.actualizarEstado);

  // actualizar valvula
  router.put("/valvulas/:id", verificarToken, requierePermiso("crear", "editar", "eliminar"), valvulaController.actualizarValvula);


  // ----------------------------------------------------------------HISTORIALES-----------------------------------------------------------------------------------------

  // Obtener historial de una válvula por ID
  router.get("/valvulas/:id/historial", verificarToken, requierePermiso("crear", "editar", "eliminar"), historialValvulaController.obtenerHistorial);

  // crear historial de las válvulas por ID
  router.post("/valvulas/historial", verificarToken, requierePermiso("api"), historialValvulaController.crearHistorial);

  // Obtener historial de un sensor de flujo por ID
  router.get("/sensores/:id/historial", verificarToken, requierePermiso("crear", "editar", "eliminar"), historialSensorFlujoController.obtenerHistorial);

  // crear historial de un sensor de flujo por ID
  router.post("/sensores/historial", verificarToken, requierePermiso("api"), historialSensorFlujoController.crearHistorial);

  router.get("/valvulas-con-sensor", verificarToken, requierePermiso("crear", "editar", "eliminar"), valvulaController.obtenerResumen);

  router.get('/proximas', verificarToken, requierePermiso("crear", "editar", "eliminar"), programacionHorarioController.obtenerProximasProgramaciones);

  return router;
};
