const express = require("express");
const jwt = require("jsonwebtoken");
const { verificarToken, requierePermiso } = require("../middlewares/auth");
const SECRET = "123456";

module.exports = (db, io) => {
  const router = express.Router();

  // Ruta de prueba para ver usuarios
  router.get("/prueba", async (req, res) => {
    const usuarios = await db.Usuario.findAll();
    res.json(usuarios);
  });

  // Ruta la informacion del usuario logueado
  router.get("/userinfo", verificarToken, (req, res) => {
    res.json({
      id: req.usuario.id,
      rol: req.usuario.rol,
      permisos: req.usuario.permisos
    });
  });
  
  // Login
  router.post("/login", async (req, res) => {
    const { correo, contrasenia } = req.body;

    const usuario = await db.Usuario.findOne({
      where: { correo, contrasenia },
      include: {
        model: db.Rol,
        include: db.Permiso
      }
    });

    if (!usuario) {
      return res.status(401).json({ status: "error", message: "Credenciales inválidas" });
    }

    const permisos = usuario.Rol.Permisos.map(p => p.permiso);

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        rol: usuario.Rol.nombre_rol,
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

  return router;
};
