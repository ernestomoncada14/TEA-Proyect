const view = require("../../utils/view");
const SECRET = "123456";
const jwt = require("jsonwebtoken");
// const { DiaProgramacion } = require("../models");
// const { where } = require("sequelize");

module.exports = (db) => {

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

//============================================================================

    const vistaCrearUsuario = async (req, res) => {
        try {
            res.render("crear_usuario");
        } catch (err) {
            console.error("Error en ruta /crear_usuario", err);
            res.status(500).send("Error interno del servidor");
        }
    };

    const crearUsuario = async (req, res) => {
      const bcrypt = require("bcrypt");
      try {
        const { nombre, correo, contrasenia, hogar } = req.body;
    
        // Validar existencia previa
        const existente = await db.Usuario.findOne({ where: { Correo: correo } });
        if (existente) return res.status(400).send("Ya existe un usuario con ese correo");
    
        const hash = await bcrypt.hash(contrasenia, 10);
    
        // Crear usuario con rol habitante (id 2)
        const nuevoUsuario = await db.Usuario.create({
          NombreCompleto: nombre,
          Correo: correo,
          Contrasenia: hash,
          RolId: 3
        });
    
        // Si se incluye hogar, crear hogar
        if (hogar) {
          const { descripcion, sectorId, geometria } = hogar;
    
          if (!geometria || geometria.length < 4) {
            return res.status(400).send("El polígono debe tener al menos 3 puntos cerrados");
          }
    
          const nuevoHogar = await db.Hogar.create({
            SectorId: sectorId,
            Descripcion: descripcion,
            GeoMetria: {
              type: 'Polygon',
              coordinates: [geometria] // Sequelize espera [ [ [lng, lat], ... ] ]
            }
          });
    
          // Asociar usuario al hogar (si hay tabla intermedia UsuarioHogar)
          await db.UsuarioHogar.create({
            UsuarioId: nuevoUsuario.UsuarioId,
            HogarId: nuevoHogar.HogarId
          });
        }
    
        res.status(201).json({ mensaje: "Usuario creado con éxito" });
      } catch (err) {
        console.error("Error al crear usuario:", err);
        res.status(500).send("Error interno del servidor");
      }
    };
//============================================================================

    const login = async (req, res) => {
        const bcrypt = require("bcrypt");
        const { correo, contrasenia } = req.body;
        const usuario = await db.Usuario.findOne({
          where: {
            Correo: correo
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

        const esValida = await bcrypt.compare(contrasenia, usuario.Contrasenia);

        if (!esValida || usuario.Contrasenia === contrasenia) {
          return res.status(401).send("Credenciales inválidas");
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
        res.json({ status: "ok", message: "Login exitoso", rol: usuario.Rol.NombreRol, id: usuario.UsuarioId });
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

    const verHabitante = async (req, res) => {
        try {
          const habitante = await db.Usuario.findByPk(req.params.id, {
            include: {
              model: db.Hogar,
              include: db.Sector
            }
          });

          if (!habitante) {
            return res.status(404).send("Habitante no encontrado");
          }

          const habitantePlano = habitante?.toJSON();

          res.render("habitante", { habitante });
        } catch (err) {
            console.error("Error al obtener habitantes:", err);
            res.status(500).json({ error: "Error interno del servidor" });
        }
    };

    return {
        index,
        panel,
        logout,
        prueba,
        userInfo,
        login,
        loginClient,
        vistaCrearUsuario,
        crearUsuario,
        verHabitante
    };
}