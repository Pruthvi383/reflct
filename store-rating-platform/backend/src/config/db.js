const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  dialect: "postgres",
  logging: false,
  define: {
    underscored: true,
    createdAt: "created_at",
    updatedAt: false
  }
});

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(60), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  address: { type: DataTypes.STRING(400), allowNull: false },
  role: {
    type: DataTypes.ENUM("admin", "user", "store_owner"),
    allowNull: false,
    defaultValue: "user"
  }
}, {
  tableName: "users",
  indexes: [{ fields: ["name"] }, { fields: ["email"] }, { fields: ["role"] }]
});

const Store = sequelize.define("Store", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(60), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  address: { type: DataTypes.STRING(400), allowNull: false }
}, {
  tableName: "stores",
  indexes: [{ fields: ["name"] }, { fields: ["email"] }]
});

const Rating = sequelize.define("Rating", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } }
}, {
  tableName: "ratings",
  indexes: [{ unique: true, fields: ["user_id", "store_id"] }]
});

User.hasOne(Store, { foreignKey: { name: "owner_id", allowNull: false }, as: "store", onDelete: "RESTRICT" });
Store.belongsTo(User, { foreignKey: { name: "owner_id", allowNull: false }, as: "owner" });
User.hasMany(Rating, { foreignKey: { name: "user_id", allowNull: false }, as: "ratings", onDelete: "CASCADE" });
Rating.belongsTo(User, { foreignKey: { name: "user_id", allowNull: false }, as: "user" });
Store.hasMany(Rating, { foreignKey: { name: "store_id", allowNull: false }, as: "ratings", onDelete: "CASCADE" });
Rating.belongsTo(Store, { foreignKey: { name: "store_id", allowNull: false }, as: "store" });

async function connectDb() {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected");
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, Sequelize, Op: Sequelize.Op, User, Store, Rating, connectDb };
