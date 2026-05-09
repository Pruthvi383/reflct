const bcrypt = require("bcrypt");
const { Sequelize, Op, User, Store, Rating } = require("../config/db");
const { userSafe, pageOptions, sortOrder, averageRating } = require("./helpers");

function searchFilter(query, fields) {
  const search = query.search || query.q;
  if (!search) return {};
  return { [Op.or]: fields.map((field) => ({ [field]: { [Op.iLike]: `%${search}%` } })) };
}

async function dashboard(req, res, next) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count()
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (error) {
    next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const { page, limit, offset } = pageOptions(req.query);
    const where = searchFilter(req.query, ["name", "email", "address", "role"]);
    if (req.query.role) where.role = req.query.role;
    const result = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      order: sortOrder(req.query, ["name", "email"], "name"),
      limit,
      offset
    });
    res.json({ data: result.rows, total: result.count, page, limit });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] }, include: [{ model: Store, as: "store" }] });
    if (!user) return res.status(404).json({ message: "User not found", statusCode: 404 });
    const payload = userSafe(user);
    if (payload.role === "store_owner" && payload.store) payload.store.averageRating = await averageRating(payload.store.id);
    res.json(payload);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ ...req.body, password });
    res.status(201).json(userSafe(user));
  } catch (error) {
    next(error);
  }
}

async function listStores(req, res, next) {
  try {
    const { page, limit, offset } = pageOptions(req.query);
    const where = searchFilter(req.query, ["name", "email", "address"]);
    const rows = await Store.findAll({
      where,
      attributes: [
        "id",
        "name",
        "email",
        "address",
        "owner_id",
        "created_at",
        [Sequelize.fn("COALESCE", Sequelize.fn("ROUND", Sequelize.cast(Sequelize.fn("AVG", Sequelize.col("ratings.rating")), "numeric"), 1), 0), "overallRating"]
      ],
      include: [{ model: Rating, as: "ratings", attributes: [] }],
      group: ["Store.id"],
      order: req.query.sortBy === "rating" ? [[Sequelize.literal('"overallRating"'), String(req.query.order).toLowerCase() === "desc" ? "DESC" : "ASC"]] : sortOrder(req.query, ["name", "email"], "name"),
      limit,
      offset,
      subQuery: false
    });
    const total = await Store.count({ where });
    res.json({ data: rows, total, page, limit });
  } catch (error) {
    next(error);
  }
}

async function createStore(req, res, next) {
  try {
    const owner = await User.findByPk(req.body.owner_id);
    if (!owner || owner.role !== "store_owner") {
      return res.status(400).json({ message: "owner_id must belong to a store_owner user", statusCode: 400 });
    }
    const store = await Store.create(req.body);
    res.status(201).json(store);
  } catch (error) {
    next(error);
  }
}

module.exports = { dashboard, listUsers, getUser, createUser, listStores, createStore };
