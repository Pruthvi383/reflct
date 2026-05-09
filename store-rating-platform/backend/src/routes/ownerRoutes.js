const router = require("express").Router();
const owner = require("../controllers/ownerController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/dashboard", authenticate, authorize("store_owner"), owner.dashboard);

module.exports = router;
