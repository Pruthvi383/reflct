const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const { errorHandler } = require("./middleware/error");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, service: "store-rating-platform-api" }));
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", storeRoutes);
app.use("/api/store-owner", ownerRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found", statusCode: 404 }));
app.use(errorHandler);

module.exports = app;
