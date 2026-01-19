require("dotenv").config();
require("./cron");
require("./models");

const app = require("./app");
const sequelize = require("./config/sequelize");

const PORT = process.env.PORT || 5000;

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Sequelize connected");

        await sequelize.sync({ alter: true });
        console.log("All models synced");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Startup error:", error);
    }
})();
