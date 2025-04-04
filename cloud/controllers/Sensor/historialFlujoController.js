

module.exports  = (db, io) => {

    const obtenerHistorial = async (req, res) => {
        try {
          const historial = await db.HistorialFlujo.findAll({
            where: { SensorId: req.params.id },
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
          const registros = lista.map(({ ValorFlujo, Fecha }) => ({
            SensorId: req.params.id,
            ValorFlujo,
            Fecha: Fecha || new Date()
          }));
    
          const nuevos = await db.HistorialFlujo.bulkCreate(registros);
    
          nuevos.forEach(registro => {
            io.emit("nuevo_historial_sensor", registro);
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