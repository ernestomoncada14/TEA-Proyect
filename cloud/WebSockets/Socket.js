const jwt = require("jsonwebtoken");
const SECRET = "123456";

module.exports = (io, db) => {
  // Middleware para verificar JWT desde cookie
  io.use((socket, next) => {
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find(c => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      console.log("Cliente sin token");
      // return next();
      return next(new Error("No autorizado"));
    }

    try {
      const decoded = jwt.verify(token, SECRET);
      socket.usuario = decoded; // adjunta usuario al socket
      return next();
    } catch (err) {
      console.log("Token inválido:", err.message);
      return next(new Error("Token inválido"));
    }
  });

  io.on("connection", async (socket) => {
    if (socket.usuario) {
      console.log("🟢 Cliente autenticado:", socket.usuario.NombreCompleto);
    } else {
      console.log("🟡 Cliente no autenticado");
    }

    socket.emit("init", "Hola desde el servidor");

    socket.on("disconnect", () => {
      console.log("🔴 Cliente desconectado");
    });
  });
};
