(async () => {
  const express = require("express");
  const http = require("http");
  const { Server } = require("socket.io");

  const sequelize = require("./config/database");
  const NumeroModel = require("./models/numero");
  const initSocket = require("./WebSockets/Socket");
  const initApiRoutes = require("./routes/api");
  const initWebRoutes = require("./routes/web");
  const cookieParser = require("cookie-parser");

  // Ejemplo de cómo usar la DB
  const db = require("./models");

  await db.sequelize.authenticate();
  console.log("🟢 Conectado a MySQL con Sequelize");

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  // MiddlewareNumero
  // app.use(express.static("public"));
  app.use(express.json());
  app.use(cookieParser());
  
  // Rutas
  app.use("/", initWebRoutes(db, io));
  app.use("/api/", initApiRoutes(db, io));

  // WebSockets
  initSocket(io, db);

  // Iniciar servidor
  server.listen(3000, () => {
    console.log("🟢 Servidor corriendo en http://localhost:3000");
  });

})();
