require("dotenv").config();
require("./cron");
require("./models");
const app = require("./app");
const sequelize = require("./config/sequelize");
const http = require("http");
const { Server } = require("socket.io");
const socketAuthMiddleware = require("./middlewares/socket.middleware");
const socketHandler = require("./socket/socketHandler");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

io.use(socketAuthMiddleware);
socketHandler(io);

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connected");

        await sequelize.sync({ alter: true });
        console.log("All models synced");

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Startup error:", error);
    }
})();