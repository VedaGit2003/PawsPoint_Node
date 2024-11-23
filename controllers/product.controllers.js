import productModel from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateFields, validateSellers } from "../utils/validateData.js";
import userModel from "../models/user.models.js";

const getAllProducts = asyncHandler(async (req, res) => {});

const createProducts = asyncHandler(async (req, res) => {
  let { name, brand, price, description, category, product_Images } = req.body;
  validateFields(
    [name, price, brand, description, category, product_Images],
    req,
    res,
  );

  const seller_Info = req.user._id;
  const verifySeller = await userModel
    .findOne({ _id: seller_Info })
    .select(" -password ");

  // if any other guy who's not a seller and trying to create a product then it will give an error
  validateSellers(verifySeller, res, res);

  const newProduct = await productModel.create({
    name,
    brand,
    price,
    description,
    category,
    product_Images,
    seller_Info: verifySeller,
  });

  if (!newProduct) {
    return res.json(
      new ApiError(
        400,
        "Something went wrong while creating the product",
        "NetworkError",
      ),
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newProduct, "New Product Created successfully"));
});

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
