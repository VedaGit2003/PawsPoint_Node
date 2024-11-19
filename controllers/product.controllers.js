import productModel from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllProducts = asyncHandler();
const createProducts = asyncHandler();
const getProduct = asyncHandler();
const updateProduct = asyncHandler();
const deleteProduct = asyncHandler();
const searchProduct = asyncHandler();
const getProductsBySellerId = asyncHandler();
const getProductsBySellerName = asyncHandler();

export {
  getAllProducts,
  createProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  getProductsBySellerId,
  getProductsBySellerName,
};
