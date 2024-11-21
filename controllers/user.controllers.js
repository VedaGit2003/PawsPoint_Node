import userModel from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import validator from "validator";
import bcrypt from "bcrypt";

const validateFields = (fields) => {
  if (fields.some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
};

const validateEmails = (email) => {
  if (!validator.isEmail(email)) {
    throw new ApiError(400, "Email is not valid");
  }
};

const signUpUser = asyncHandler(async (req, res) => {
  let { user_Name, email, password, user_Role, profile_Image, orders } =
    req.body;

  validateFields([user_Name, email, password]);
  validateEmails(email);

  // Set user_Role to 'vet' if not provided
  if (!user_Role) {
    user_Role = "consumer"; // Default to 'consumer' if not provided
  }

  // Ensure valid userRole
  const validRoles = ["consumer", "seller", "vet"];
  if (!validRoles.includes(user_Role)) {
    throw new ApiError(400, "Invalid user role");
  }

  const existUser = await userModel.findOne({ email });

  if (existUser) {
    throw new ApiError(400, "User with same email already exist");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    user_Name,
    email,
    password: hashedPassword,
    user_Role: "consumer",
    profile_Image,
    vet_Description: undefined,
    vet_Type: undefined,
    orders: [],
  });

  if (!newUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const createdUser = await userModel.findById(newUser._id).select("-password");

  return res
    .status(201)
    .json(
      new ApiResponse(201, createdUser, "Consumer Registered Successfully")
    );
});

const signUpVet = asyncHandler(async (req, res) => {
  let {
    user_Name,
    email,
    password,
    vet_Type,
    vet_Description,
    profile_Image,
    user_Role, // Check if user_Role is in the body
  } = req.body;

  // Validate required fields for vet signup
  validateFields([user_Name, email, password, vet_Type, vet_Description]);
  validateEmails(email);

  // Set user_Role to 'vet' if not provided
  if (!user_Role) {
    user_Role = "vet"; // Default to 'vet' if not provided
  }

  // Ensure valid userRole
  const validRoles = ["consumer", "seller", "vet"];
  if (!validRoles.includes(user_Role)) {
    throw new ApiError(400, "Invalid user role");
  }

  // Check if the user already exists
  const userExisted = await userModel.findOne({ email });
  if (userExisted) {
    throw new ApiError(400, "User with the same email already exists");
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user, explicitly excluding orders for vet
  const newUser = await userModel.create({
    user_Name,
    user_Role, // Set the role (it's either 'consumer', 'seller', or 'vet')
    email,
    password: hashedPassword, // Store the hashed password
    vet_Type,
    vet_Description,
    profile_Image,
    // Exclude orders from the user data for vet role
    orders: undefined, // Explicitly setting orders to undefined for vet users
  });

  // Find and return the created user, excluding the password
  const createdUser = await userModel.findById(newUser._id).select("-password"); // Exclude the password field from the response

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "Vet created successfully"));
});

const signUpSeller = asyncHandler(async (req, res) => {
  let { user_Name, email, password, user_Role, profile_Image, orders } =
    req.body;

  validateFields([user_Name, email, password]);
  validateEmails(email);

  // Set user_Role to 'vet' if not provided
  if (!user_Role) {
    user_Role = "seller"; // Default to 'consumer' if not provided
  }

  // Ensure valid userRole
  const validRoles = ["consumer", "seller", "vet"];
  if (!validRoles.includes(user_Role)) {
    throw new ApiError(400, "Invalid user role");
  }

  const existUser = await userModel.findOne({ email });

  if (existUser) {
    throw new ApiError(400, "User with same email already exist");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    user_Name,
    email,
    password: hashedPassword,
    user_Role: "seller",
    profile_Image,
    vet_Description: undefined,
    vet_Type: undefined,
    orders: [],
  });

  if (!newUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  const createdUser = await userModel.findById(newUser._id).select("-password");

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "Seller Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {});
const logoutUser = asyncHandler(async (req, res) => {});
const getUserId = asyncHandler(async (req, res) => {});
const updateUserId = asyncHandler(async (req, res) => {});
const refreshAccessToken = asyncHandler(async (req, res) => {});

export {
  signUpUser,
  signUpSeller,
  signUpVet,
  loginUser,
  logoutUser,
  getUserId,
  updateUserId,
  refreshAccessToken,
};
