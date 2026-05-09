const router = require("express").Router();
const admin = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

router.use(authenticate, authorize("admin"));
router.get("/dashboard", admin.dashboard);
router.get("/users", admin.listUsers);
router.get("/users/:id", admin.getUser);
router.post("/users", validate(schemas.adminUser), admin.createUser);
router.get("/stores", admin.listStores);
router.post("/stores", validate(schemas.store), admin.createStore);

module.exports = router;
