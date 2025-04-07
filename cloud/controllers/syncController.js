const { where } = require('sequelize');
const { DiaSemana, ProgramacionHorario, DiaProgramacion, Sector, Placa, Valvula, SensorFlujo } = require('../models');

module.exports = () => {
    const dia_semana = async (req, res) => {
        try {
            const dias = await DiaSemana.findAll();
            res.json(dias);
        } catch (err) {
            res.status(500).json({ error: 'Error al obtener los días' });
        }
    };

    const programaciones = async (req, res) => {
        try {
            const programaciones = await ProgramacionHorario.findAll({
                where: { Estado: true } // o Estado: 1 si es entero
            });
            res.json(programaciones);
        } catch (err) {
            console.error("Error al obtener programaciones:", err);
            res.status(500).json({ error: 'Error al obtener programaciones' });
        }
    };    

    const dias_programados = async (req, res) => {
        try {
            // Obtener los id de todas las programaciones activas
            const programacionesActivas = await ProgramacionHorario.findAll({
                where: { Estado: true },
                raw: true
            });
            const programacionIds = programacionesActivas.map(p => p.ProgramacionId);
            const diasProgramados = await DiaProgramacion.findAll( {where: { ProgramacionId: programacionIds }});
            res.json(diasProgramados);
        } catch (err) {
            res.status(500).json({ error: 'Error al obtener días programados' });
        }
    };

    const sectores = async (req, res) => {
        try {
            const sectores = await Sector.findAll();
            res.json(sectores);
        } catch (err) {
            res.status(500).json({ error: 'Error al obtener sectores' });
        }
    };

    const placas = async (req, res) => {
        try {
            const placas = await Placa.findAll();
            res.json(placas);
        } catch (err) {
            res.status(500).json({ error: 'Error al obtener placas' });
        }
    };

    const valvulas = async (req, res) => {
        try {
            const valvulas = await Valvula.findAll();
            res.json(valvulas);
        } catch (err) {
            console.error("Error en /api/sync/valvulas:", err); // <- log importante
            res.status(500).json({ error: 'Error al obtener válvulas', detalle: err.message });
        }
    };
    
    const sensores = async (req, res) => {
        try {
            const sensores = await SensorFlujo.findAll();
            res.json(sensores);
        } catch (err) {
            console.error("Error en /api/sync/sensores:", err); // <- log importante
            res.status(500).json({ error: 'Error al obtener sensores', detalle: err.message });
        }
    };
    

    return {
        dia_semana,
        programaciones,
        dias_programados,
        sectores,
        placas,
        valvulas,
        sensores
    };
}