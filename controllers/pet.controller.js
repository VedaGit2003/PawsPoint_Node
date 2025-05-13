import petModel from "../models/pet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateFields, validateSellers } from "../utils/validateData.js";
import userModel from "../models/user.models.js";
import petModels from "../models/pet.models.js";

import PetOrder from "../models/petOrder.model.js";


const getAllPets = asyncHandler(async (req, res) => {
  let { page = 1, pet_Type, breed_Name, pet_Age, price, sort } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = 100;

  const queryObject = {};

  // applying filter
  if (pet_Type) {
    queryObject.pet_Type = new RegExp(pet_Type, "i");
  }

  if (breed_Name) {
    queryObject.breed_Name = new RegExp(breed_Name, "i");
  }

  if (pet_Age) {
    queryObject.pet_Age = parseInt(pet_Age);
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

  // getting the total pets based on the filteraton
  const totalPets = await petModel.countDocuments(queryObject);

  // handle sorting
  let sortObject = {};
  if (sort) {
    /*
    sorting based on the filteration, like if user wants to getAll available pets
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

  const pets = await petModel
    .find(queryObject)
    .sort(sortObject)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  if (pets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, pets, "No pets available"));
  }

  const totalPages = Math.ceil(totalPets / limitNum);
  const remainingPages = totalPages - page;

  const pagination = {
    currentPage: page,
    totalPages: totalPages,
    remainingPages: remainingPages > 0 ? remainingPages : 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, pets, "pets feteched successfully", pagination));
});

const createPets = asyncHandler(async (req, res) => {
  let { pet_Type, breed_Name, pet_Images, pet_Description, pet_Age, price } =
    req.body;

  validateFields(
    [pet_Type, breed_Name, pet_Images, pet_Description, pet_Age, price],
    req,
    res
  );

  const seller_Info = req.user._id;
  const verifySeller = await userModel
    .findById({ _id: seller_Info })
    .select(" -password ");

  validateSellers(verifySeller, res, res);

  const newPet = await petModel.create({
    pet_Type,
    breed_Name,
    pet_Images,
    pet_Description,
    pet_Age,
    price,
    seller_Info: verifySeller,
  });

  if (!newPet) {
    return res.json(new ApiError(400, "Something went wrong", "NetworkError"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newPet, "Pet created successfully"));
});

const getPet = asyncHandler(async (req, res) => {
  let pet_Id = req.params.pet_id;

  const pet = await petModels.findById({ _id: pet_Id });
  if (!pet) {
    return res.json(
      new ApiError(400, "Pet not found", "NotFoundError: Pet not found")
    );
  }

  return res.status(201).json(new ApiResponse(201, pet, "Pet found"));
});

const updatePet = asyncHandler(async (req, res) => {
  let pet_Id = req.params.pet_id;
  let { pet_Type, breed_Name, pet_Images, pet_Description, pet_Age, price } =
    req.body;

  const petExist = await petModel.findById({ _id: pet_Id });
  if (!petExist) {
    return res.json(
      new ApiError(400, "Pet not found", "NotFoundError: Pet not found")
    );
  }

  const petUpdated = await petModel.findByIdAndUpdate(
    { _id: pet_Id },
    {
      $set: {
        pet_Type,
        pet_Description,
        pet_Images,
        pet_Age,
        breed_Name,
        price,
      },
    },
    {
      new: true,
    }
  );

  if (!petUpdated) {
    return res.json(new ApiError(500, "Something went wrong", "NetworkError"));
  }

  return res.status(201).json(new ApiResponse(201, petUpdated, "Pet updated"));
});

const deletePet = asyncHandler(async (req, res) => {
  let pet_Id = req.params.pet_id;

  const petExist = await petModel.findById({ _id: pet_Id });
  if (!petExist) {
    return res.json(new ApiError(403, "Something went wrong", "NetworkError"));
  }

  const petDeleted = await petModel.findByIdAndDelete({ _id: pet_Id });
  return res
    .status(201)
    .json(new ApiResponse(201, petDeleted, "Pet deleted successfully"));
});

const searchPets = asyncHandler(async (req, res) => {
  let {
    page = 1,
    pet_Type,
    breed_Name,
    pet_Description,
    pet_Age,
    price,
    sort
  } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = 5;

  const queryObject = {};

  // Applying filters
  if (pet_Type) {
    queryObject.pet_Type = new RegExp(pet_Type, "i");
  }

  if (breed_Name) {
    queryObject.breed_Name = new RegExp(breed_Name, "i");
  }

  if (pet_Age) {
    queryObject.pet_Age = parseInt(pet_Age);
  }

  if (price) {
    const { min, max } = price;
    queryObject.price = {};
    if (min) queryObject.price.$gte = parseFloat(min);
    if (max) queryObject.price.$lte = parseFloat(max);
  }

  // Get total pets count based on the filter
  const totalPets = await petModel.countDocuments(queryObject);

  // Handle sorting
  let sortObject = {};
  if (sort) {
    const sortFields = sort.split(",").map((field) => field.trim());
    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        sortObject[field.slice(1)] = -1; // Descending order
      } else {
        sortObject[field] = 1; // Ascending order
      }
    });
  }

  // Query the pets based on filters and pagination
  const pets = await petModel
    .find(queryObject)
    .sort(sortObject)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  // If no pets found, return early with a response
  if (pets.length === 0) {
    return res.status(200).json(new ApiResponse(200, pets, "No pets available"));
  }

  // Pagination
  const totalPages = Math.ceil(totalPets / limitNum);
  const remainingPages = totalPages - page;

  const pagination = {
    currentPage: page,
    totalPages: totalPages,
    remainingPages: remainingPages > 0 ? remainingPages : 0,
  };

  // Send a successful response with pets and pagination
  return res.status(200).json(new ApiResponse(200, pets, "Pets fetched successfully", pagination));
});





const getPetsBySellerId = asyncHandler(async (req, res) => {
  let { page = 1, pet_Type, breed_Name, pet_Age, price, sort } = req.query;
  let sellerId = req.params.sellerId;

  // validate the seller
  const seller = await userModel.findById(sellerId).select(" -password ");
  if (seller) validateSellers(seller, req, res);
  else return res.json(new ApiError(400, "Invalid user id"));

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = 5;

  const queryObject = {};

  // applying filter
  queryObject.seller_Info = seller;

  if (pet_Type) {
    queryObject.pet_Type = new RegExp(pet_Type, "i");
  }

  if (breed_Name) {
    queryObject.breed_Name = new RegExp(breed_Name, "i");
  }

  if (pet_Age) {
    queryObject.pet_Age = parseInt(pet_Age);
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

  // getting the total pets based on the filteraton
  const totalPets = await petModel.countDocuments(queryObject);

  // handle sorting
  let sortObject = {};
  if (sort) {
    /*
    sorting based on the filteration, like if user wants to getAll available pets
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

  const pets = await petModel
    .find(queryObject)
    .sort(sortObject)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  if (pets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, pets, "No pets available"));
  }

  const totalPages = Math.ceil(totalPets / limitNum);
  const remainingPages = totalPages - page;

  const pagination = {
    currentPage: page,
    totalPages: totalPages,
    remainingPages: remainingPages > 0 ? remainingPages : 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      pets, 
      "pets feteched successfully", 
      pagination
    )
  );
});



// =====================orders====================
const createPetOrder = asyncHandler(async (req, res) => {
  const {userId, petId, phone, address } = req.body;
  // const userId = req.user._id;

  if (userId || !petId || !phone || !address) {
    return res.json(new ApiError(400, "All fields are required"));
  }

  const pet = await petModel.findById(petId);
  if (!pet) {
    return res.json(new ApiError(404, "Pet not found"));
  }

  const order = await PetOrder.create({
    pet: pet._id,
    user: userId,
    phone,
    address,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Pet order placed successfully"));
});

// Get all orders for a user
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await PetOrder.find({ user: userId })
    .populate("pet")
    .populate("user", "-password");

  if (!orders || orders.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No orders found for this user"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get all orders for a user mobile
const getUserMobileOrders = asyncHandler(async (req, res) => {
  const {userId} = req.body;

  const orders = await PetOrder.find({ user: userId })
    .populate("pet")
    .populate("user", "-password");

  if (!orders || orders.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No orders found for this user"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

// Get all pet orders (admin/seller use case)
const getAllPetOrders = asyncHandler(async (req, res) => {
  try{
    const user_Id=req.user._id
  const user = await userModel.findById(user_Id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.user_Role !== "admin") {
      return res.status(403).json({ success: false, message: "User is not Admin" });
    }
  const orders = await PetOrder.find()
    .populate("pet")
    .populate("user", "-password");

  return res
    .status(200)
    .json({success:true,message:"Pet Orders Getting Successfully",orders});
  }catch(error){
res.status(500).json({success:false,message:"Pet Orders Getting failed",error})
  }
});

export {
  
  getAllPets,
  createPets,
  getPet,
  updatePet,
  deletePet,
  searchPets,
  getPetsBySellerId,
  createPetOrder,
  getUserOrders,
  getUserMobileOrders,
  getAllPetOrders,
};
