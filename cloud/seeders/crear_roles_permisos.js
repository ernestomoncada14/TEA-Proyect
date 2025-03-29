const { sequelize, Rol, Permiso, RolPermiso } = require("../models");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a la base de datos");

    // Definir roles
    const roles = ["admin", "fontanero", "habitante"];

    // Definir permisos
    const permisos = ["ver", "crear", "editar", "eliminar", "api"];

    // Crear roles si no existen
    const rolMap = {};
    for (const nombre of roles) {
      const [rol] = await Rol.findOrCreate({
        where: { NombreRol: nombre }
      });
      rolMap[nombre] = rol.RolId;
      console.log(`Rol creado o ya existente: ${nombre}`);
    }

    // Crear permisos si no existen
    const permisoMap = {};
    for (const nombre of permisos) {
      const [permiso] = await Permiso.findOrCreate({
        where: { NombrePermiso: nombre }
      });
      permisoMap[nombre] = permiso.PermisoId;
      console.log(`Permiso creado o ya existente: ${nombre}`);
    }

    // Asociaciones de ejemplo entre roles y permisos
    const asociaciones = {
      admin: ["ver", "crear", "editar", "eliminar", "api"],
      fontanero: ["ver", "crear", "editar", "eliminar"],
      habitante: ["ver"]
    };

    for (const [nombreRol, permisosAsignados] of Object.entries(asociaciones)) {
      const rolId = rolMap[nombreRol];
      for (const nombrePermiso of permisosAsignados) {
        const permisoId = permisoMap[nombrePermiso];
        await RolPermiso.findOrCreate({
          where: {
            RolId: rolId,
            PermisoId: permisoId
          }
        });
        console.log(`Asociación: Rol ${nombreRol} → Permiso ${nombrePermiso}`);
      }
    }

    console.log("Roles y permisos configurados correctamente.");
    await sequelize.close();
  } catch (err) {
    console.error("Error en la configuración:", err);
    await sequelize.close();
  }
})();
