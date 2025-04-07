const view = require("../../utils/view");
const SECRET = "123456";
const jwt = require("jsonwebtoken");
// const { DiaProgramacion } = require("../models");
// const { where } = require("sequelize");

module.exports = (db, io) => {
    const index = async (req, res) => {
        try {
            res.sendFile(view("index"));
        } catch (err) {
            console.error("Error en ruta /", err);
            res.status(500).send("Error interno del servidor");
        }
    };
    const panel = async (req, res) => {
        try {
            res.sendFile(view("panel"));
        } catch (err) {
            console.error("Error en ruta /panel", err);
            res.status(500).send("Error interno del servidor");
        }
    };
    const logout = async (req, res) => {
        try {
            res.clearCookie("token");
            res.redirect("/");
        } catch (err) {
            console.error("Error en ruta /logout", err);
            res.status(500).send("Error interno del servidor");
        }
    };
    const prueba = async (req, res) => {
        res.json({
          message: "hola mundo"
        });
    };

    const userInfo = async (req, res) => {
        res.json({
          id: req.usuario.UsuarioId,
          rol: req.usuario.rol,
          permisos: req.usuario.permisos
        });
    };

    const login = async (req, res) => {
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
            rol: usuario.Rol.NombreRol,
            permisos
          },
          SECRET,
          { expiresIn: "5h" }
        );
        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 60 * 60 * 5 * 1000
        });
        res.json({ status: "ok", message: "Login exitoso" });
    };

    const loginClient = async (req, res) => {
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
            rol: usuario.Rol.NombreRol,
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
    };

    return {
        index,
        panel,
        logout,
        prueba,
        userInfo,
        login,
        loginClient
    };
}