const jwt = require("jsonwebtoken");
const view = require("../utils/view");
const SECRET = "123456";

function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).sendFile(view("no-autorizado"));

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    console.error("Error en el token:", err.message);
    return res.status(403).sendFile(view("no-autorizado"));
  }
}

function requierePermiso(permiso) {
  return (req, res, next) => {

    if (
      !req.usuario ||
      !Array.isArray(req.usuario.permisos) ||
      !req.usuario.permisos.includes(permiso)
    ) {
      // return res.status(403).json({ status: "error", message: "Permiso denegado" });
      req.flash("error", "No tiene permiso para acceder a esta sección");
      return res.redirect("back");

    }

    next();
  };
}


module.exports = {
  verificarToken,
  requierePermiso
};
