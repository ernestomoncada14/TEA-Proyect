const express = require("express");
const router = express.Router();

module.exports = (Numero, io) => {
  router.post("/", async (req, res) => {
    const { numero } = req.body;
    try {
      const nuevo = await Numero.create({ numero });
      io.emit("nuevo-numero", nuevo);
      res.json(nuevo);
    } catch (err) {
      console.error("Error al insertar:", err);
      res.sendStatus(500);
    }
  });

  return router;
};
