const { sequelize, Usuario } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos");

    const usuarios = [
      {
        RolId: 1,
        NombreCompleto: "api user",
        Correo: "apiUser1418API@sistema-agua",
        Contrasenia: "DjtdDtsDvty;dErbEh,dd{45$QdiEDED"
      },
      {
        RolId: 2,
        NombreCompleto: "Ernesto(neto) Moncada",
        Correo: "neto@example.com",
        Contrasenia: "123"
      },
      {
        RolId: 3,
        NombreCompleto: "Daniel Henrriquez",
        Correo: "daniel@example.com",
        Contrasenia: "123"
      },
      {
        RolId: 3,
        NombreCompleto: "Ingrid Bauedano",
        Correo: "ingrid@example.com",
        Contrasenia: "123"
      }
    ];

    for (const u of usuarios) {
      await Usuario.findOrCreate({
        where: { Correo: u.Correo },
        defaults: u
      });
      console.log(`✔ Usuario registrado o existente: ${u.NombreCompleto}`);
    }

    await sequelize.close();
    console.log("✔ Todos los usuarios fueron creados correctamente.");
  } catch (err) {
    console.error("❌ Error al crear usuarios:", err);
    await sequelize.close();
  }
})();
