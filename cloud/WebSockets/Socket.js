module.exports = (io, db) => {
    io.on("connection", async (socket) => {
      console.log("🟢 Cliente conectado");
  
      try {

        socket.emit("init", "Hola desde el servidor");
  
      } catch (err) {
        console.error("Error al consultar:", err);
      }
  
      socket.on("disconnect", () => {
        console.log("🔴 Cliente desconectado");
      });
    });
  };
  