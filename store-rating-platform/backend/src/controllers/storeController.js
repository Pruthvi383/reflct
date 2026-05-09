const { Sequelize, Op, Store, Rating } = require("../config/db");

async function listStores(req, res, next) {
  try {
    const search = req.query.search;
    const where = search
      ? { [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { address: { [Op.iLike]: `%${search}%` } }] }
      : {};
    const stores = await Store.findAll({
      where,
      attributes: [
        "id",
        "name",
        "email",
        "address",
        [Sequelize.fn("COALESCE", Sequelize.fn("ROUND", Sequelize.cast(Sequelize.fn("AVG", Sequelize.col("ratings.rating")), "numeric"), 1), 0), "overallRating"]
      ],
      include: [{ model: Rating, as: "ratings", attributes: [] }],
      group: ["Store.id"],
      order: [["name", "ASC"]]
    });
    const ownRatings = await Rating.findAll({ where: { user_id: req.user.id } });
    const ownByStore = new Map(ownRatings.map((rating) => [rating.store_id, rating]));
    res.json(stores.map((store) => {
      const plain = store.toJSON();
      delete plain.ratings;
      return { ...plain, userRating: ownByStore.get(plain.id) || null };
    }));
  } catch (error) {
    next(error);
  }
}

async function submitRating(req, res, next) {
  try {
    const [rating, created] = await Rating.findOrCreate({
      where: { user_id: req.user.id, store_id: req.body.store_id },
      defaults: { rating: Number(req.body.rating) }
    });
    if (!created) return res.status(409).json({ message: "You have already rated this store", statusCode: 409 });
    res.status(201).json(rating);
  } catch (error) {
    next(error);
  }
}

async function updateRating(req, res, next) {
  try {
    const rating = await Rating.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!rating) return res.status(404).json({ message: "Rating not found", statusCode: 404 });
    rating.rating = Number(req.body.rating);
    await rating.save();
    res.json(rating);
  } catch (error) {
    next(error);
  }
}

module.exports = { listStores, submitRating, updateRating };
