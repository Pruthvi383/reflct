const app = require("../src/app");
const { sequelize } = require("../src/config/db");

let ready;

async function ensureDb() {
  if (!ready) {
    ready = sequelize.authenticate();
  }
  return ready;
}

module.exports = async (req, res) => {
  try {
    if (req.url.startsWith("/api")) {
      await ensureDb();
    }
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(500).json({ message: "Database connection failed", statusCode: 500 });
  }
};
