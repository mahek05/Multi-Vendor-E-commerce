const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { handleStripeWebhook } = require("./controllers/webhook.controller");

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.post("/api/webhook/stripe",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
);

app.use(express.json());
app.use("/api", require("./routes"));

module.exports = app;