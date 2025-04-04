const view = require("../../utils/view");
module.exports = (db, io) => {

    const verSector = async (req, res) => {
        try {
          const SectorId = req.params.id;
      
          res.render("sector", { SectorId });
        } catch (err) {
          console.error("Error en ruta /sector/:id", err);
          res.status(500).send("Error interno del servidor");
        }
    };
    const listarSectores = async (req, res) => {
        res.sendFile(view("ver_sectores"));
      };

    const sectores = async (req, res) => {
      try {
        const sectores = await db.Sector.findAll({ order: [["SectorId", "ASC"]] });
        res.json(sectores);
      } catch (err) {
        console.error("Error al obtener sectores:", err);
        res.status(500).json({ error: "Error al obtener los sectores" });
      }
    };

    const crearSector = async (req, res) => {
      const { Nombre, Descripcion, GeoMetria } = req.body;
      try {
        const nuevoSector = await db.Sector.create({
          Nombre,
          Descripcion,
          GeoMetria: { type: "Polygon", coordinates: GeoMetria }
        });
        res.json(nuevoSector);
      } catch (err) {
        console.error("Error al crear sector:", err);
        res.status(500).json({ error: "Error al crear el sector" });
      }
    };

    const leerUno = async (req, res) => {
      try {
        const sector = await db.Sector.findByPk(req.params.id, {
          include: [
            { model: db.ProgramacionHorario, include: [{ model: db.DiaProgramacion, include: [{model: db.DiaSemana}] }] },
          ]
        });
        if (!sector) return res.status(404).json({ error: "Sector no encontrado" });
        res.json(sector);
      } catch (err) {
        console.error("Error al buscar sector:", err);
        res.status(500).json({ error: "Error interno" });
      }
    };

    const actualizarSector = async (req, res) => {
      const { Nombre, Descripcion, GeoMetria } = req.body;
      try {
        await db.Sector.update(
          { Nombre, Descripcion, GeoMetria: { type: "Polygon", coordinates: GeoMetria } },
          { where: { SectorId: req.params.id } }
        );
        res.sendStatus(200);
      } catch (err) {
        console.error("Error al actualizar sector:", err);
        res.status(500).json({ error: "Error interno" });
      }
    };

    const eliminarSector = async (req, res) => {
      try {
        const eliminado = await db.Sector.destroy({
          where: { SectorId: req.params.id }
        });
    
        if (!eliminado) {
          return res.status(404).json({ error: "Sector no encontrado" });
        }
    
        res.json({ message: "Sector eliminado" });
      } catch (err) {
        console.error("Error al eliminar sector:", err);
        res.status(500).json({ error: "Error interno" });
      }
    };

    return {
        verSector,
        listarSectores,
        sectores,
        crearSector,
        leerUno,
        actualizarSector,
        eliminarSector,
    };
}