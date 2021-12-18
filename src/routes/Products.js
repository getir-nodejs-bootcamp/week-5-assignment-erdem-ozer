const express = require("express");

const productsController = require("../controllers/Products");

const schemas = require("../validations/Products");
const validate = require("../middlewares/validate");

const authenticate = require("../middlewares/authenticate");
const authenticateAdmin = require("../middlewares/authenticateAdmin");

const router = express.Router();

router.route("/").get(index);

router
  .route("/:id/add-comment")
  .post(
    authenticate,
    validate(schemas.addComment, "body"),
    productsController.addComment
  );

router
  .route("/")
  .post(
    authenticateAdmin,
    validate(schemas.createProduct, "body"),
    productsController.create
  );

router
  .route("/:id")
  .patch(
    authenticateAdmin,
    validate(schemas.updateProduct, "body"),
    productsController.update
  );

router
  .route("/:id/add-media")
  .post(authenticateAdmin, productsController.addMedia);

module.exports = router;
