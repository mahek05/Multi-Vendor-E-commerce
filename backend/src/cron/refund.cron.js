const cron = require("node-cron");
const { refundOrderItem } = require("../controllers/refund.controller");

console.log("refund.cron Working");
cron.schedule("*/30 * * * *", async () => {
    console.log("Running refund cron");
});
