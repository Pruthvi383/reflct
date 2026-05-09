const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
const ownerRoutes = require("./routes/ownerRoutes");
const { errorHandler } = require("./middleware/error");
const { seedDemoData } = require("./config/demoSeed");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, service: "store-rating-platform-api" }));
app.get("/health", (req, res) => res.json({ ok: true }));
app.post("/setup/seed", async (req, res, next) => {
  try {
    if (!process.env.SETUP_SECRET || req.headers["x-setup-secret"] !== process.env.SETUP_SECRET) {
      return res.status(403).json({ message: "Forbidden", statusCode: 403 });
    }
    const result = await seedDemoData();
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", storeRoutes);
app.use("/api/store-owner", ownerRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found", statusCode: 404 }));
app.use(errorHandler);

module.exports = app;
