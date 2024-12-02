import productModel from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateFields, validateSellers } from "../utils/validateData.js";
import userModel from "../models/user.models.js";

const getAllProducts = asyncHandler(async (req, res) => {
  // show the 5 products on each page, irrespective of it's category
  let { page = 1, category, price, brand, sort } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = 5; // Limit products per range

  const queryObject = {};
  // Applying filter
  if (category) {
    queryObject.category = new RegExp(category, "i");
  }

  if (brand) {
    queryObject.brand = new RegExp(brand, "i");
  }

  if (price) {
    /*
     * Extracting the min and max from the price query object
      and used MongoDB's $gte (greater than or equal to) and $lte (lesser than or equal to)
      to get the products as per the filteration
     */

    const { min, max } = price;
    queryObject.price = {};
    // console.log(price);
    if (min) queryObject.price.$gte = parseFloat(min);
    if (max) queryObject.price.$lte = parseFloat(max);
  }

  // getting the total products based on the filteraton
  const totalProducts = await productModel.countDocuments(queryObject);

  // handle sorting
  let sortObject = {};
  if (sort) {
    /*
    sorting based on the filteration, like if user wants to getAll products
    based on name in descending order as well it's categories in ascending order
    he/she can perform it

    1. splitting the object and mapping it
    2. going through the array and checking the very first character
    3. if it's starting with '-' it means it's going to descending otherwise ascending
    */

    const sortFields = sort.split(",").map((field) => field.trim());
    // console.log(sortFields);
    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        sortObject[field.slice(1)] = -1; // Descending order
      } else {
        sortObject[field] = 1; // Ascending order
      }
    });
  }

  const products = await productModel
    .find(queryObject) // finding products based on the required queries
    .sort(sortObject) // and sorting them if required
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  if (products.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, products, "No Products available"));
  }

  const totalPages = Math.ceil(totalProducts / limitNum);
  const remainingPages = totalPages - page;

  const pagination = {
    currentPage: page,
    totalPages: totalPages,
    remainingPages: remainingPages > 0 ? remainingPages : 0,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        products,
        "Products feteched successfully",
        pagination
      )
    );
});

const createProducts = asyncHandler(async (req, res) => {
  let { name, brand, price, description, category, product_Images } = req.body;
  validateFields(
    [name, price, brand, description, category, product_Images],
    req,
    res
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
        "NetworkError"
      )
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
      "NotFoundError: Product not found"
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
      new ApiError(400, "Product not found", "NotFoundError: Product not found")
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
    { new: true } // by default findByIdAndUpdate returns the original document before the update is applied
    // therefore, we need to add  { new: true } to get the updated document as a response, it's only meant for testing purpose
  );

  if (!updateProd) {
    return res.json(
      new ApiError(
        500,
        "Something went wrong while updating product",
        "NetworkError"
      )
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
      new ApiError(400, "Product not found", "NotFoundError: Product not found")
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
