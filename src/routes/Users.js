const express = require("express");

const usersController = require("../controllers/Users");
const schemas = require("../validations/Users");

const validate = require("../middlewares/validate");
const authenticateAdmin = require("../middlewares/authenticateAdmin");

const router = express.Router();

router
  .route("/create-admin-user")
  .post(validate(schemas.createAdminUser, "body"), usersController.create);

router
  .route("/login")
  .post(validate(schemas.userLogin, "body"), usersController.login);

router
  .route("/reset-password")
  .post(
    validate(schemas.resetPasswordValidation, "body"),
    usersController.resetPassword
  );

// For admin prilivleges
router.route("/").get(authenticateAdmin, usersController.index);

router
  .route("/")
  .post(
    authenticateAdmin,
    validate(schemas.createUser, "body"),
    usersController.create
  );

module.exports = router;
