const bcrypt = require("bcrypt");
const { sequelize, User, Store, Rating } = require("./db");

const password = "Password@123";

async function seed() {
  await sequelize.sync({ alter: true });
  await Rating.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await Store.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });
  await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true });

  const hashed = await bcrypt.hash(password, 10);
  const [admin, owner1, owner2, owner3, ...users] = await User.bulkCreate([
    { name: "System Administrator Account", email: "admin@example.com", password: hashed, address: "1 Admin Avenue, Platform City", role: "admin" },
    { name: "Store Owner Alpha Account", email: "owner1@example.com", password: hashed, address: "10 Owner Street, Platform City", role: "store_owner" },
    { name: "Store Owner Bravo Account", email: "owner2@example.com", password: hashed, address: "20 Owner Street, Platform City", role: "store_owner" },
    { name: "Store Owner Charlie Account", email: "owner3@example.com", password: hashed, address: "30 Owner Street, Platform City", role: "store_owner" },
    { name: "Normal User One Demo Account", email: "user1@example.com", password: hashed, address: "101 User Lane, Platform City", role: "user" },
    { name: "Normal User Two Demo Account", email: "user2@example.com", password: hashed, address: "102 User Lane, Platform City", role: "user" },
    { name: "Normal User Three Demo Account", email: "user3@example.com", password: hashed, address: "103 User Lane, Platform City", role: "user" },
    { name: "Normal User Four Demo Account", email: "user4@example.com", password: hashed, address: "104 User Lane, Platform City", role: "user" },
    { name: "Normal User Five Demo Account", email: "user5@example.com", password: hashed, address: "105 User Lane, Platform City", role: "user" }
  ], { returning: true });

  const stores = await Store.bulkCreate([
    { name: "Alpha Everyday Market", email: "alpha-store@example.com", address: "500 Market Road, Platform City", owner_id: owner1.id },
    { name: "Bravo Fresh Grocery", email: "bravo-store@example.com", address: "600 Grocery Road, Platform City", owner_id: owner2.id },
    { name: "Charlie Corner Store", email: "charlie-store@example.com", address: "700 Corner Road, Platform City", owner_id: owner3.id }
  ], { returning: true });

  await Rating.bulkCreate([
    { user_id: users[0].id, store_id: stores[0].id, rating: 5 },
    { user_id: users[1].id, store_id: stores[0].id, rating: 4 },
    { user_id: users[2].id, store_id: stores[1].id, rating: 3 },
    { user_id: users[3].id, store_id: stores[1].id, rating: 4 },
    { user_id: users[4].id, store_id: stores[2].id, rating: 5 },
    { user_id: users[0].id, store_id: stores[2].id, rating: 4 }
  ]);

  console.log("Seed completed");
  console.log(`Demo password for all accounts: ${password}`);
  console.log(`Admin email: ${admin.email}`);
  await sequelize.close();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
