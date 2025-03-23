const jwt = require("jsonwebtoken");
const SECRET = "123456";

function verificarToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).send("No autorizado (token faltante)");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    console.error("❌ Error en el token:", err.message); // 👈 LOG
    return res.status(403).send("Token inválido o expirado");
  }
}

function requierePermiso(permiso) {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.permisos.includes(permiso)) {
      return res.status(403).json({ status: "error", message: "No autorizado" });
    }
    next();
  };
}

module.exports = {
  verificarToken,
  requierePermiso
};
