 
 
 module.exports = (db, io) => {

    const actualizarValvula = async (req, res) => {
        try {
          const { Descripcion, Ubicacion } = req.body;
          await db.Valvula.update(
            { Descripcion, Ubicacion: Ubicacion },
            { where: { ValvulaId: req.params.id } }
          );
          io.emit("valvula_actualizada", {
            ValvulaId: req.params.id,
            Descripcion,
            Ubicacion
          });
          res.sendStatus(200);
        } catch (err) {
          console.error("Error al actualizar válvula:", err);
          res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    const actualizarEstado = async (req, res) => {
        try {
          const valvulaId = req.params.id;
          const nuevoEstado = req.body.Estado === "true";
      
          // 1. Actualizar estado de la válvula
          await db.Valvula.update({ Estado: nuevoEstado }, { where: { ValvulaId: valvulaId } });
      
          // 2. Buscar el sensor asociado (uno a uno)
          const sensor = await db.SensorFlujo.findOne({ where: { ValvulaId: valvulaId } });
          const valvula = await db.Valvula.findOne({ where: { ValvulaId: valvulaId } });
          if (sensor) {
            await db.SensorFlujo.update({ Estado: nuevoEstado }, { where: { SensorId: sensor.SensorId } });
      
            // Emitir evento de actualización de sensor
            io.emit("estado_sensor_actualizado_M", {
              SensorId: sensor.SensorId,
              Pin: sensor.Pin,
              NuevoEstado: nuevoEstado
            });
            io.emit("estado_sensor_actualizado", {
              SensorId: sensor.SensorId,
              Pin: sensor.Pin,
              NuevoEstado: nuevoEstado
            });
          }
      
          // Emitir evento de actualización de válvula
          io.emit("estado_valvula_actualizado_M", {
            ValvulaId: valvulaId,
            Pin: valvula.Pin,
            NuevoEstado: nuevoEstado
          });
          io.emit("estado_valvula_actualizado", {
            ValvulaId: valvulaId,
            Pin: valvula.Pin,
            NuevoEstado: nuevoEstado
          });
      
          res.sendStatus(200);
        } catch (err) {
          console.error("Error al cambiar estado de válvula y sensor:", err);
          res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    return {
        actualizarValvula,
        actualizarEstado,
    };
 }