
module.exports = (db, io) => {
    const programaciones = async (req, res) => {
        try {
          const datos = await db.ProgramacionHorario.findAll({
            include: [
              { model: db.Usuario },
              { model: db.Sector },
              {
                model: db.DiaProgramacion,
                include: [{ model: db.DiaSemana }]
              }
            ],
            order: [["ProgramacionId", "DESC"]]
          });
          res.json(datos);
        } catch (err) {
          console.error("Error al obtener programaciones:", err);
          res.status(500).json({ error: "Error al obtener las programaciones" });
        }
    };

    const crearProgramacion = async (req, res) => {
        const { SectorId, HoraInicio, HoraFinal } = req.body;
        let Dias = req.body.Dias;
        if (typeof Dias === "string") {
          Dias = Dias.split(","); // Ahora es un array
        }
        
        // Asegurarse de que sea array
        if (!Array.isArray(Dias)) Dias = [Dias];
      
        try {
          const nueva = await db.ProgramacionHorario.create({
            SectorId,
            UsuarioId: req.usuario.UsuarioId,
            HoraInicio,
            HoraFinal,
            Estado: true
          });
      
          // Insertar días asociados
          for (const DiaId of Dias) {
            await db.DiaProgramacion.create({
              ProgramacionId: nueva.ProgramacionId,
              DiaId
            });
          }
      
          const diasTexto = await db.DiaSemana.findAll({
            where: { DiaId: Dias },
            raw: true
          });
          
          const DiasProgramacion = await db.DiaProgramacion.findAll({
            where: { ProgramacionId: nueva.ProgramacionId },
            raw: true
          });
      
          // crear json de respuesta
          const resp = {
            ProgramacionId: nueva.ProgramacionId,
            SectorId: nueva.SectorId,
            HoraInicio: nueva.HoraInicio,
            HoraFinal: nueva.HoraFinal,
            Estado: nueva.Estado,
            Dia: diasTexto.map(d => d.Dia).join(", "),
            DiasSeparados: diasTexto,
            DiasProgramacion
          };
      
          // emitir evento a los clientes conectados
          io.emit("nueva_programacion", resp);
      
          // devolver una respuesta ok
          res.sendStatus(200);
          
        } catch (err) {
          console.error("Error al crear programación:", err);
          res.status(500).json({ error: "No se pudo crear la programación" });
        }
    };

    const programacionPorId = async (req, res) => {
        try {
          const prog = await db.ProgramacionHorario.findByPk(req.params.id, {
            include: [
              { model: db.Usuario },
              { model: db.Sector },
              {
                model: db.DiaProgramacion,
                include: [{ model: db.DiaSemana }]
              }
            ]
          });
      
          if (!prog) return res.status(404).json({ error: "No encontrada" });
          res.json(prog);
        } catch (err) {
          console.error("Error al buscar programación:", err);
          res.status(500).json({ error: "Error interno" });
        }
    };

    const programacionPorSector = async (req, res) => {
        try {
          const prog = await db.ProgramacionHorario.findAll({
            where: { SectorId: req.params.id },
            include: [
              { model: db.Usuario },
              { model: db.Sector },
              {
                model: db.DiaProgramacion,
                include: [{ model: db.DiaSemana }]
              }
            ]
          });
      
          if (!prog) return res.status(404).json({ error: "No encontrada" });
          res.json(prog);
        } catch (err) {
          console.error("Error al buscar programación:", err);
          res.status(500).json({ error: "Error interno" });
        }
    };

    const actualizarProgramacion = async (req, res) => {
        try {
          await db.ProgramacionHorario.update(
            {
              HoraInicio: req.body.HoraInicio,
              HoraFinal: req.body.HoraFinal,
            },
            { where: { ProgramacionId: req.params.id } }
          );
      
          // Limpiar días anteriores
          await db.DiaProgramacion.destroy({ where: { ProgramacionId: req.params.id } });
      
          // Asegurar que Dias sea un array
          let dias = req.body.Dias;
          if (typeof dias === "string") {
            dias = dias.split(",").map(Number);
          }
      
          const nuevosDias = dias.map(diaId => ({
            ProgramacionId: req.params.id,
            DiaId: diaId
          }));
      
          if (nuevosDias.length > 0) {
            await db.DiaProgramacion.bulkCreate(nuevosDias);
          }
      
          // obtener los dias en texto
          const Dias = await db.DiaSemana.findAll({
            where: { DiaId: dias },
            raw: true
          });
      
          io.emit("programacion_actualizada", {
            ProgramacionId: req.params.id,
            HoraInicio: req.body.HoraInicio,
            HoraFinal: req.body.HoraFinal,
            Dias: Dias
          });
          res.sendStatus(200);
        } catch (err) {
          console.error("Error actualizando programación:", err);
          res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    const cambiarEstado = async (req, res) => {
        const { Estado } = req.body;
        await db.ProgramacionHorario.update(
          { Estado },
          { where: { ProgramacionId: req.params.id } }
        );
        
        io.emit("estado_programacion_actualizado", {
          ProgramacionId: req.params.id,
          NuevoEstado: Estado
        });
        
        // devolver un codigo 200
        res.status(200).json({ message: "Estado actualizado" });
    };

    const eliminarProgramacion = async (req, res) => {
        try {
          const eliminada = await db.ProgramacionHorario.destroy({
            where: { ProgramacionId: req.params.id }
          });
      
          if (!eliminada) {
            return res.status(404).json({ error: "Programación no encontrada" });
          }
          io.emit("programacion_eliminada", {
            ProgramacionId: req.params.id
          });
          res.json({ message: "Programación eliminada" });
        } catch (err) {
          console.error("Error al eliminar:", err);
          res.status(500).json({ error: "No se pudo eliminar la programación" });
        }
    };

    return {
        programaciones,
        crearProgramacion,
        programacionPorId,
        programacionPorSector,
        actualizarProgramacion,
        cambiarEstado,
        eliminarProgramacion,
    };
}