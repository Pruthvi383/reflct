const { sequelize } = require("./db");

async function migrate() {
  await sequelize.sync({ alter: true });
  console.log("Database migration completed");
  await sequelize.close();
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
