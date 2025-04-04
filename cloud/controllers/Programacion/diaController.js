
module.exports = (db, io) => {
    
    const dias = async (req, res) => {
        try {
          const dias = await db.DiaSemana.findAll({ order: [["DiaId", "ASC"]] });
          res.json(dias);
        } catch (err) {
          console.error("Error al obtener días:", err);
          res.status(500).json({ error: "Error al obtener los días de la semana" });
        }
    };

    return {
        dias,
    };
}