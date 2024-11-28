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

const getProduct = asyncHandler(async (req, res) => {
  let product_Id = req.params.product_id;

  const product = await productModel.findById({ _id: product_Id });
  if (!product) {
    return res.json(
      400,
      "Product not found",
      "NotFoundError: Product not found",
    );
  }

  return res.status(201).json(new ApiResponse(201, product, "Product found"));
});

const updateProduct = asyncHandler(async (req, res) => {
  let product_Id = req.params.product_id;
  let { name, brand, price, description, category, product_Images } = req.body;

  const productExist = await productModel.findById(product_Id);
  if (!productExist) {
    return res.json(
      new ApiError(
        400,
        "Product not found",
        "NotFoundError: Product not found",
      ),
    );
  }

  // we are not using updateOne() because updateOne() is applicable when there's more than one to update
  // or when we do not want the updated document in response

  const updateProd = await productModel.findByIdAndUpdate(
    { _id: product_Id },
    {
      name: name || productExist.name,
      brand: brand || productExist.brand,
      price: price || productExist.price,
      description: description || productExist.description,
      category: category || productExist.category,
      product_Images: product_Images || productExist.product_Images,
    },
    { new: true }, // by default findByIdAndUpdate returns the original document before the update is applied
    // therefore, we need to add  { new: true } to get the updated document as a response, it's only meant for testing purpose
  );

  if (!updateProd) {
    return res.json(
      new ApiError(
        500,
        "Something went wrong while updating product",
        "NetworkError",
      ),
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, updateProd, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  let product_Id = req.params.product_id;

  const productExist = await productModel.findById({ _id: product_Id });
  if (!productExist) {
    return res.json(
      new ApiError(
        400,
        "Product not found",
        "NotFoundError: Product not found",
      ),
    );
  }

  const deleteProd = await productModel.findByIdAndDelete({ _id: product_Id });
  return res
    .status(200)
    .json(new ApiResponse(200, deleteProd, "Product deleted successfully"));
});

const searchProduct = asyncHandler();
const getProductsBySellerId = asyncHandler();
// const getProductsBySellerName = asyncHandler();

export {
  getAllProducts,
  createProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
  getProductsBySellerId,
  // getProductsBySellerName,
};
