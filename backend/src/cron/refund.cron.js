const cron = require("node-cron");
const { refundOrderItems } = require("../controllers/refund.controller");

console.log("refund.cron Working");
cron.schedule("0 0 * * *", async () => {
    console.log("Running refund job");
    await refundOrderItems();
});