const { sequelize, Usuario } = require("../models");

(async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log("Conectado a la base de datos");

    // Crear 3 usuarios
    const usuarios = [
      {
        id_usuario: 1,
        id_rol: 1,
        nombre_completo: "Ernesto(neto) Moncada",
        correo: "neto@example.com",
        contrasenia: "123"
      },
      {
        id_usuario: 2,
        id_rol: 1,
        nombre_completo: "Daniel Henrriquez",
        correo: "daniel@example.com",
        contrasenia: "123"
      },
      {
        id_usuario: 3,
        id_rol: 1,
        nombre_completo: "Ingrid Bauedano",
        correo: "ingrid@example.com",
        contrasenia: "123"
      }
    ];

    for (const u of usuarios) {
      await Usuario.create(u);
      console.log(`Usuario creado: ${u.nombre_completo}`);
    }

    console.log("Todos los usuarios fueron creados correctamente.");
    await sequelize.close();
  } catch (err) {
    console.error("Error al crear usuarios:", err);
    await sequelize.close();
  }
})();
