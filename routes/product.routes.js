import { Router } from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  getAllProducts,
  createProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  getProductsBySellerId,
  getProductsBySellerName,
} from "../controllers/product.controllers.js";

const router = Router();

router.route("/").get(getAllProducts);

// create a new product
router.route("/new").post(isLoggedIn, createProducts);

router
  .route("/p/:product_id")
  .get(getProduct)
  .put(isLoggedIn, updateProduct)
  .delete(isLoggedIn, deleteProduct);

// search product by keywords
router.route("/search").get(searchProduct);

// search product by seller id
router.route("/seller/:sellerId").get(getProductsBySellerId);

// search product by seller name
router.route("/seller/:username").get(getProductsBySellerName);

export default router;
