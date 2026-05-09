const router = require("express").Router();
const { register, login, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validate, schemas } = require("../middleware/validate");

router.post("/register", validate(schemas.register), register);
router.post("/login", validate(schemas.login), login);
router.patch("/change-password", authenticate, validate(schemas.changePassword), changePassword);

module.exports = router;
