
module.exports  = (db, io) => {

  const obtenerHistorial = async (req, res) => {
    const { Op } = require('sequelize');
    try {
      const { desde, hasta } = req.query;
  
      const condiciones = {
        ValvulaId: req.params.id,
      };

      console.log(desde, hasta);
  
      if (desde && hasta) {
        condiciones.Fecha = { [Op.between]: [new Date(desde), new Date(hasta)] };
      } else if (desde) {
        condiciones.Fecha = { [Op.gte]: new Date(desde) };
      } else if (hasta) {
        const fechaInicio = new Date(hasta);
        fechaInicio.setDate(fechaInicio.getDate() - 30);
        condiciones.Fecha = { [Op.between]: [fechaInicio, new Date(hasta)] };
      } else {
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 30);
        condiciones.Fecha = { [Op.between]: [fechaInicio, new Date()] };
      }
  
      const historial = await db.HistorialValvula.findAll({
        where: condiciones,
        order: [["Fecha", "ASC"]],
      });
  
      res.json(historial);
    } catch (err) {
      console.error("Error al obtener historial de válvula:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

    const crearHistorial = async (req, res) => {
        try {
          const lista = Array.isArray(req.body) ? req.body : [req.body]; // Acepta uno o varios
          const registros = lista.map(({ ValvulaId, Estado, Fecha }) => ({
            ValvulaId,
            Estado,
            Fecha: Fecha || new Date()
          }));
    
          const nuevos = await db.HistorialValvula.bulkCreate(registros);
          io.emit("nuevo_historial_valvula", nuevos);

          nuevos.forEach(element => {
            // actualizar el estado de la válvula
            db.Valvula.update({ Estado: element.Estado }, { where: { ValvulaId: element.ValvulaId } });
            io.emit("estado_valvula_actualizado", ({ValvulaId: element.ValvulaId, NuevoEstado: element.Estado}));
          });
    
          res.status(201).json({ message: "Historial de válvula guardado" });
        } catch (err) {
          console.error("Error al guardar historial de válvula:", err);
          res.status(500).json({ error: "Error al guardar historial" });
        }
    };

    return {
        obtenerHistorial,
        crearHistorial,
    };
}