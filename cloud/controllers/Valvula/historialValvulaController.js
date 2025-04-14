

module.exports  = (db, io) => {

    const obtenerHistorial = async (req, res) => {
        try {
          const historial = await db.HistorialValvula.findAll({
            where: { ValvulaId: req.params.id },
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