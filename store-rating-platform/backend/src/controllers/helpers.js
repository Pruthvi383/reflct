const { Sequelize, Rating } = require("../config/db");

function userSafe(user) {
  if (!user) return null;
  const plain = user.toJSON ? user.toJSON() : user;
  delete plain.password;
  return plain;
}

function pageOptions(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  return { page, limit, offset: (page - 1) * limit };
}

function sortOrder(query, allowed, fallback = "name") {
  const sortBy = allowed.includes(query.sortBy) ? query.sortBy : fallback;
  const order = String(query.order).toLowerCase() === "desc" ? "DESC" : "ASC";
  return [[sortBy, order]];
}

async function averageRating(storeId) {
  const avg = await Rating.findOne({
    attributes: [[Sequelize.fn("AVG", Sequelize.col("rating")), "avg"]],
    where: { store_id: storeId },
    raw: true
  });
  return avg?.avg ? Number(Number(avg.avg).toFixed(1)) : 0;
}

module.exports = { userSafe, pageOptions, sortOrder, averageRating };
