const { sequelize } = require("./db");
const { seedDemoData } = require("./demoSeed");

async function seed() {
  const { adminEmail, demoPassword } = await seedDemoData();
  console.log("Seed completed");
  console.log(`Demo password for all accounts: ${demoPassword}`);
  console.log(`Admin email: ${adminEmail}`);
  await sequelize.close();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
