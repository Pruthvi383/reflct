const { Sequelize, Store, Rating, User } = require("../config/db");

async function dashboard(req, res, next) {
  try {
    const store = await Store.findOne({ where: { owner_id: req.user.id } });
    if (!store) return res.json({ store: null, averageRating: 0, raters: [] });

    const avg = await Rating.findOne({
      attributes: [[Sequelize.fn("AVG", Sequelize.col("rating")), "avg"]],
      where: { store_id: store.id },
      raw: true
    });
    const sortBy = ["name", "email", "rating"].includes(req.query.sortBy) ? req.query.sortBy : "name";
    const order = String(req.query.order).toLowerCase() === "desc" ? "DESC" : "ASC";
    const raters = await Rating.findAll({
      where: { store_id: store.id },
      attributes: ["id", "rating", "created_at"],
      include: [{ model: User, as: "user", attributes: ["name", "email"] }],
      order: sortBy === "rating" ? [["rating", order]] : [[{ model: User, as: "user" }, sortBy, order]]
    });

    res.json({
      store,
      averageRating: avg?.avg ? Number(Number(avg.avg).toFixed(1)) : 0,
      raters: raters.map((row) => ({
        id: row.id,
        name: row.user.name,
        email: row.user.email,
        rating: row.rating,
        created_at: row.created_at
      }))
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { dashboard };
