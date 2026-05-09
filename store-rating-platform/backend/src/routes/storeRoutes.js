const router = require("express").Router();
const stores = require("../controllers/storeController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

router.get("/stores", authenticate, authorize("user"), stores.listStores);
router.post("/ratings", authenticate, authorize("user"), validate(schemas.rating), stores.submitRating);
router.patch("/ratings/:id", authenticate, authorize("user"), validate({ rating: schemas.rating.rating }), stores.updateRating);

module.exports = router;
