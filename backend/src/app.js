const express = require("express");
const cors = require("cors");
require("dotenv").config();

const sequelize = require("./config/database");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const ProcurementRequest = require("./models/ProcurementRequest");
const procurementRoutes = require("./routes/procurementRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/requests", procurementRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "IT Procurement System API is running"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        res.json({
            status: "OK",
            database: "connected",
            usersTable: "ready"
        });
    } catch (error) {
        res.status(500).json({
            status: "ERROR",
            database: "disconnected",
            message: error.message
        });
    }
});

module.exports = app;