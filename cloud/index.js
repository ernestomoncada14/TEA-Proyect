const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const sequelize = require("./config/database");
const NumeroModel = require("./models/numero");
const initSocket = require("./WebSockets/Socket");
const initRoutes = require("./routes/api");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Conexión y modelo
const Numero = NumeroModel(sequelize);

// Probar conexión
sequelize.authenticate()
  .then(() => console.log("✅ Conectado a MySQL con Sequelize"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Middleware
app.use(express.static("public"));
app.use(express.json());

// Rutas
app.use("/api/numeros", initRoutes(Numero, io));

// WebSockets
initSocket(io, Numero);

// Iniciar servidor
server.listen(3000, () => {
  console.log("✅ Servidor corriendo en http://localhost:3000");
});
