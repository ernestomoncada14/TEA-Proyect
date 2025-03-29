const { sequelize, DiaSemana } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos");

    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado"
    ];

    for (const dia of dias) {
      await DiaSemana.findOrCreate({ where: { Dia: dia } });
      console.log(`Día insertado o ya existente: ${dia}`);
    }

    await sequelize.close();
    console.log("Inserción completada.");
  } catch (err) {
    console.error("Error al insertar días:", err);
    await sequelize.close();
  }
})();
