const { sequelize, Rol, Permiso, RolPermiso } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conectado a la base de datos");

    // 1️⃣ Definir roles
    const roles = [
      { id_rol: 1, nombre_rol: "admin" },
      { id_rol: 2, nombre_rol: "operador" },
      { id_rol: 3, nombre_rol: "tecnico" }
    ];

    // 2️⃣ Definir permisos
    const permisos = [
      { id_permiso: 1, permiso: "ver" },
      { id_permiso: 2, permiso: "crear" },
      { id_permiso: 3, permiso: "editar" },
      { id_permiso: 4, permiso: "eliminar" }
    ];

    // 3️⃣ Crear roles si no existen
    for (const rol of roles) {
      await Rol.findOrCreate({ where: { id_rol: rol.id_rol }, defaults: rol });
      console.log(`🔐 Rol creado o ya existente: ${rol.nombre_rol}`);
    }

    // 4️⃣ Crear permisos si no existen
    for (const permiso of permisos) {
      await Permiso.findOrCreate({ where: { id_permiso: permiso.id_permiso }, defaults: permiso });
      console.log(`🔑 Permiso creado o ya existente: ${permiso.permiso}`);
    }

    // 5️⃣ Asociaciones de ejemplo entre roles y permisos
    const asociaciones = [
      // Admin tiene todos los permisos
      { id_rol: 1, permisos: [1, 2, 3, 4] },
      // Operador solo puede ver y crear
      { id_rol: 2, permisos: [1, 2] },
      // Técnico solo puede ver
      { id_rol: 3, permisos: [1] }
    ];

    for (const asociacion of asociaciones) {
      for (const id_permiso of asociacion.permisos) {
        await RolPermiso.findOrCreate({
          where: {
            id_rol: asociacion.id_rol,
            id_permiso: id_permiso
          }
        });
        console.log(`🧩 Asociación: Rol ${asociacion.id_rol} → Permiso ${id_permiso}`);
      }
    }

    console.log("🎉 Roles y permisos configurados correctamente.");
    await sequelize.close();
  } catch (err) {
    console.error("❌ Error en la configuración:", err);
    await sequelize.close();
  }
})();
