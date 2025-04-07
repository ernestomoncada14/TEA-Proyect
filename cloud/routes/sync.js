const express = require("express");

const { verificarToken, requierePermiso } = require("../middlewares/auth");
// const { DiaProgramacion } = require("../models");
// const { where } = require("sequelize");


module.exports = () => {
    
    const router = express.Router();
    const syncController = require("../controllers/syncController")();

    // GET /api/sync/diasemana
    router.get('/diasemana', syncController.dia_semana);

    // GET /api/sync/programaciones
    router.get('/programaciones', syncController.programaciones);

    // GET /api/sync/dias-programados
    router.get('/dias-programados', syncController.dias_programados);

    // GET /api/sync/sectores
    router.get('/sectores', syncController.sectores);

    // GET /api/sync/placas
    router.get('/placas', syncController.placas);

    // GET /api/sync/valvulas
    router.get('/valvulas', syncController.valvulas);

    // GET /api/sync/sensores
    router.get('/sensores', syncController.sensores);

    return router;
}