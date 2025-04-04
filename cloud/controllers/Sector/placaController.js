

module.exports = (db, io) => {
    const leerPlacaPorSector = async (req, res) => {
        try {
          const placas = await db.Placa.findAll({
            where: { SectorId: req.params.SectorId },
            include: [{ model: db.Valvula, include: [{ model: db.SensorFlujo }] }]
          });
          res.json(placas);
        } catch (err) {
          console.error("Error al obtener placas:", err);
          res.status(500).json({ error: "Error al obtener las placas" });
        }
    };

    return {
        leerPlacaPorSector,
    };
}