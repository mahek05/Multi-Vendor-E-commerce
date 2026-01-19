const cron = require("node-cron");
const { processPayouts } = require("../controllers/payout.controller");

console.log("payout.cron Working");
cron.schedule("0 0 * * *", async () => {
    console.log("Running daily payout job");
    await processPayouts();
});