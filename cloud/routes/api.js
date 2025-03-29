const express = require("express");
const jwt = require("jsonwebtoken");
const { verificarToken, requierePermiso } = require("../middlewares/auth");
const { DiaProgramacion } = require("../models");
const { where } = require("sequelize");
const SECRET = "123456";

module.exports = (db, io) => {
  const router = express.Router();

  // ----------------------------------------------------------------Hola Mundo---------------------------------------------------------------------------------------

  // Ruta de prueba para ver usuarios
  router.get("/prueba", async (req, res) => {
    res.json({
      message: "hola mundo"
    });
  });

  // ----------------------------------------------------------------informacion del user---------------------------------------------------------------------------

  // Ruta la informacion del usuario logueado
  router.get("/userinfo", verificarToken, requierePermiso("api"), (req, res) => {
    res.json({
      id: req.usuario.UsuarioId,
      permisos: req.usuario.permisos
    });
  });

  // ----------------------------------------------------------------LOGIN-----------------------------------------------------------------------------------------
  
  // Login
  router.post("/login", async (req, res) => {
    const { correo, contrasenia } = req.body;
    const usuario = await db.Usuario.findOne({
      where: {
        Correo: correo,
        Contrasenia: contrasenia
      },
      include: {
        model: db.Rol,
        include: {
          model: db.Permiso,
          through: { attributes: [] }
        }
      }
    });
    if (!usuario) {
      return res.status(401).json({ status: "error", message: "Credenciales inválidas" });
    }
    const permisos = usuario.Rol.Permisos.map(p => p.NombrePermiso);
    const token = jwt.sign(
      {
        UsuarioId: usuario.UsuarioId,
        permisos
      },
      SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });
    res.json({ status: "ok", message: "Login exitoso" });
  });

  // Login cliente
  router.post("/login-client", async (req, res) => {
    const { correo, contrasenia } = req.body;
    const usuario = await db.Usuario.findOne({
      where: {
        Correo: correo,
        Contrasenia: contrasenia
      },
      include: {
        model: db.Rol,
        include: {
          model: db.Permiso,
          through: { attributes: [] }
        }
      }
    });
    if (!usuario) {
      return res.status(401).json({ status: "error", message: "Credenciales inválidas" });
    }
    const permisos = usuario.Rol.Permisos.map(p => p.NombrePermiso);
    const token = jwt.sign(
      {
        UsuarioId: usuario.UsuarioId,
        permisos
      },
      SECRET,
      { expiresIn: "10y" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 10 * 365 * 24 * 60 * 60 * 1000
    });
    res.json({ status: "ok", message: "Login exitoso" });
  });

// ----------------------------------------------------------------CRUDS-----------------------------------------------------------------------------------------
// -----------------------------CRUD para dia_semana
// Leer
router.get("/dias", verificarToken, async (req, res) => {
  try {
    const dias = await db.DiaSemana.findAll({ order: [["DiaId", "ASC"]] });
    res.json(dias);
  } catch (err) {
    console.error("Error al obtener días:", err);
    res.status(500).json({ error: "Error al obtener los días de la semana" });
  }
});

// -----------------------------CRUD para Sector
// Leer
router.get("/sectores", verificarToken, async (req, res) => {
  try {
    const sectores = await db.Sector.findAll({ order: [["SectorId", "ASC"]] });
    res.json(sectores);
  } catch (err) {
    console.error("Error al obtener días:", err);
    res.status(500).json({ error: "Error al obtener los días de la semana" });
  }
});

// -----------------------------CRUD para ProgramacionHorario

// Leer todas las programaciones
router.get("/programaciones", verificarToken, async (req, res) => {
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
});

// Crear nueva programación
router.post("/programaciones", verificarToken, async (req, res) => {
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

    res.json({
      ProgramacionId: nueva.ProgramacionId,
      HoraInicio: nueva.HoraInicio,
      HoraFinal: nueva.HoraFinal,
      Estado: nueva.Estado,
      Dia: diasTexto.map(d => d.Dia).join(", "),
      DiaProgramacions: DiasProgramacion,
    });
    
  } catch (err) {
    console.error("Error al crear programación:", err);
    res.status(500).json({ error: "No se pudo crear la programación" });
  }
});


// Leer una programación por ID
router.get("/programaciones/:id", verificarToken, async (req, res) => {
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
});

// leer programaciones por sector
router.get("/programaciones/sector/:id", verificarToken, async (req, res) => {
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
});

// Actualizar programación
router.put("/programaciones/:id", async (req, res) => {
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

    res.sendStatus(200);
  } catch (err) {
    console.error("Error actualizando programación:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});



// Cambiar estado de programación
router.post("/programaciones/:id/estado", verificarToken, async (req, res) => {
  const { Estado } = req.body;
  await db.ProgramacionHorario.update(
    { Estado },
    { where: { ProgramacionId: req.params.id } }
  );
  // devolver un codigo 200
  res.status(200).json({ message: "Estado actualizado" });
});


// Eliminar programación
router.delete("/programaciones/:id", verificarToken, async (req, res) => {
  try {
    const eliminada = await db.ProgramacionHorario.destroy({
      where: { ProgramacionId: req.params.id }
    });

    if (!eliminada) {
      return res.status(404).json({ error: "Programación no encontrada" });
    }

    res.json({ message: "Programación eliminada" });
  } catch (err) {
    console.error("Error al eliminar:", err);
    res.status(500).json({ error: "No se pudo eliminar la programación" });
  }
});


// -----------------------------CRUD para Sector

// Leer
router.get("/sectores", verificarToken, async (req, res) => {
  try {
    const sectores = await db.Sector.findAll({ order: [["SectorId", "ASC"]] });
    res.json(sectores);
  } catch (err) {
    console.error("Error al obtener sectores:", err);
    res.status(500).json({ error: "Error al obtener los sectores" });
  }
});

// Crear
router.post("/sectores", verificarToken, async (req, res) => {
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
});

// Leer uno
router.get("/sectores/:id", verificarToken, async (req, res) => {
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
});

// Actualizar
router.put("/sectores/:id", verificarToken, async (req, res) => {
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
});

// eliminar
router.delete("/sectores/:id", verificarToken, async (req, res) => {
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
});

// -----------------------------CRUD de Placa
// leer por sector
router.get("/placas/:SectorId", verificarToken, async (req, res) => {
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
}
);


// -----------------------------CRUD


// -----------------------------CRUD


// -----------------------------CRUD


// -----------------------------CRUD


// -----------------------------CRUD


// -----------------------------CRUD



  return router;
};
