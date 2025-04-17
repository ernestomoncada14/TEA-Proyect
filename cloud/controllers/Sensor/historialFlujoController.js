

module.exports  = (db, io) => {

  const obtenerHistorial = async (req, res) => {
    const { Op } = require('sequelize');
    try {
      const { desde, hasta } = req.query;
  
      const condiciones = {
        SensorId: req.params.id,
      };
  
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
  
      const historial = await db.HistorialFlujo.findAll({
        where: condiciones,
        order: [["Fecha", "ASC"]],
      });
  
      res.json(historial);
    } catch (err) {
      console.error("Error al obtener historial de sensor de flujo:", err);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

    const crearHistorial = async (req, res) => {
        try {
          const lista = Array.isArray(req.body) ? req.body : [req.body]; // Acepta uno o varios
          const registros = lista.map(({ SensorId, ValorFlujo, Estado, Fecha }) => ({
            SensorId,
            ValorFlujo,
            Estado,
            Fecha: Fecha || new Date()
          }));
    
          const nuevos = await db.HistorialFlujo.bulkCreate(registros);
          io.emit("nuevo_historial_sensor", nuevos);

          nuevos.forEach(element => {
            io.emit("estado_sensor_actualizado", ({SensorId: element.SensorId, NuevoEstado: element.Estado}));
          });
    
          res.status(201).json({ message: "Historial de sensor guardado" });
        } catch (err) {
          console.error("Error al guardar historial de sensor:", err);
          res.status(500).json({ error: "Error al guardar historial" });
        }
    };

    return {
        obtenerHistorial,
        crearHistorial,
    };
}