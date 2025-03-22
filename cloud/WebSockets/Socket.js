module.exports = (io, Numero) => {
    io.on("connection", async (socket) => {
      console.log("🟢 Cliente conectado");
  
      try {
        const numeros = await Numero.findAll({
          order: [["id", "DESC"]],
          limit: 10
        });
        socket.emit("lista-numeros", numeros);
  
        const ultimos = await Numero.findAll({
          order: [["id", "DESC"]],
          limit: 3
        });
        socket.emit("ultimos", ultimos);
  
      } catch (err) {
        console.error("Error al consultar:", err);
      }
  
      socket.on("disconnect", () => {
        console.log("🔴 Cliente desconectado");
      });
    });
  };
  