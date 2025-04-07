const express = require("express");

const { verificarToken, requierePermiso } = require("../middlewares/auth");
// const { DiaProgramacion } = require("../models");
// const { where } = require("sequelize");


module.exports = (db, io) => {

  const usuarioController = require("../controllers/Usuario/UsuarioController")(db, io);
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
  router.get("/userinfo", verificarToken, requierePermiso("api"), usuarioController.userInfo);

  // ----------------------------------------------------------------LOGIN-----------------------------------------------------------------------------------------
  
  // Login
  router.post("/login", usuarioController.login);

  // Login cliente
  router.post("/login-client", usuarioController.loginClient);

  // ----------------------------------------------------------------CRUDS-----------------------------------------------------------------------------------------
  // -----------------------------CRUD para dia_semana
  // Leer
  router.get("/dias", verificarToken, diaController.dias);

  // -----------------------------CRUD para Sector
  // Leer
  router.get("/sectores", verificarToken, sectorController.sectores);

  // -----------------------------CRUD para ProgramacionHorario

  // Leer todas las programaciones
  router.get("/programaciones", verificarToken, programacionHorarioController.programaciones);

  // Crear nueva programación
  router.post("/programaciones", verificarToken, programacionHorarioController.crearProgramacion);

  // Leer una programación por ID
  router.get("/programaciones/:id", verificarToken, programacionHorarioController.programacionPorId);

  // leer programaciones por sector
  router.get("/programaciones/sector/:id", verificarToken, programacionHorarioController.programacionPorSector);

  // Actualizar programación
  router.put("/programaciones/:id", programacionHorarioController.actualizarProgramacion);

  // Cambiar estado de programación
  router.post("/programaciones/:id/estado", verificarToken, programacionHorarioController.cambiarEstado);


  // Eliminar programación
  router.delete("/programaciones/:id", verificarToken, programacionHorarioController.eliminarProgramacion);


  // -----------------------------CRUD para Sector

  // Leer
  router.get("/sectores", verificarToken, sectorController.sectores);

  // Crear
  router.post("/sectores", verificarToken, sectorController.crearSector);

  // Leer uno
  router.get("/sectores/:id", verificarToken, sectorController.leerUno);

  // Actualizar
  router.put("/sectores/:id", verificarToken, sectorController.actualizarSector);

  // eliminar
  router.delete("/sectores/:id", verificarToken, sectorController.eliminarSector);

  // -----------------------------CRUD de Placa
  // leer por sector
  router.get("/placas/:SectorId", verificarToken, placaController.leerPlacaPorSector);


  // -----------------------------CRUD de valvula
  // actualizar estado de valvula
  router.post("/valvulas/:id/estado", verificarToken, valvulaController.actualizarEstado);

  // actualizar valvula
  router.put("/valvulas/:id", verificarToken, valvulaController.actualizarValvula);


  // -----------------------------CRUD de 


  // -----------------------------CRUD de 


  // -----------------------------CRUD


  // -----------------------------CRUD


  // -----------------------------CRUD

  // ----------------------------------------------------------------HISTORIALES-----------------------------------------------------------------------------------------

  // Obtener historial de una válvula por ID
  router.get("/valvulas/:id/historial", verificarToken, historialValvulaController.obtenerHistorial);

  // crear historial de una válvula por ID
  router.post("/valvulas/:id/historial", verificarToken, historialValvulaController.crearHistorial);

  // Obtener historial de un sensor de flujo por ID
  router.get("/sensores/:id/historial", verificarToken, historialSensorFlujoController.obtenerHistorial);

  // crear historial de un sensor de flujo por ID
  router.post("/sensores/:id/historial", verificarToken, historialSensorFlujoController.crearHistorial);

  return router;
};
