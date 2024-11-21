import userModel from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import validator from "validator";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

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
const validateRoles = (userRole) => {
  const validRoles = ["consumer", "seller", "vet"];
  if (!validRoles.includes(userRole)) {
    throw new ApiError(400, "Invalid user role");
  }
};

const signUpUser = asyncHandler(async (req, res) => {
  let { user_Name, email, password, user_Role, profile_Image, orders } =
    req.body;

  validateFields([user_Name, email, password]);
  validateEmails(email);

  // Set user_Role to 'vet' if not provided
  if (user_Role) {
    // Ensure valid userRole
    validateRoles(user_Role);
  } else {
    user_Role = "consumer";
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

  let token = generateToken(newUser);
  res.cookie("token", token);

  const createdUser = await userModel.findById(newUser._id).select("-password");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, token },
        "Consumer Registered Successfully"
      )
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
  if (user_Role) {
    // Ensure valid userRole
    validateRoles(user_Role);
  } else {
    user_Role = "vet";
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
  });

  let token = generateToken(newUser);
  res.cookie("token", token);

  // Find and return the created user, excluding the password
  const createdUser = await userModel.findById(newUser._id).select("-password"); // Exclude the password field from the response

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, token },
        "Vet created successfully"
      )
    );
});

const signUpSeller = asyncHandler(async (req, res) => {
  let { user_Name, email, password, user_Role, profile_Image, orders } =
    req.body;

  validateFields([user_Name, email, password]);
  validateEmails(email);

  // Set user_Role to 'vet' if not provided
  if (user_Role) {
    // Ensure valid userRole
    validateRoles(user_Role);
  } else {
    user_Role = "seller";
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

  let token = generateToken(newUser);
  res.cookie("token", token);

  const createdUser = await userModel.findById(newUser._id).select("-password");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser, token },
        "Seller Registered Successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  validateFields([email, password]);
  validateEmails(email);

  const checkUser = await userModel.findOne({ email });
  if (!checkUser) {
    throw new ApiError(400, "User does not exist");
  }

  const checkPassword = await bcrypt.compare(password, checkUser.password);
  if (!checkPassword) {
    throw new ApiError(400, "Incorrect Password!");
  }

  let token = generateToken(checkUser);
  res.cookie("token", token);

  res
    .status(201)
    .json(
      new ApiResponse(201, { user: checkUser, token }, "Login Successfull")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "");
  res.status(200).json(new ApiResponse(200, "User logged out successfully"));
});

/** 
  
const getUser = asyncHandler(async (req, res) => {
  let { user_Name } = req.params;
  if (!user_Name) {
    throw new ApiError(404, "Page not found");
  }
  const checkUser = await userModel
    .findOne({
      user_Name: { $regex: new RegExp(`^${user_Name}`, "i") }, // Match names starting with the input
    })
    .select("-password");

  if (!checkUser) {
    throw new ApiError(401, "User does not exist");
  }

  res
    .status(201)
    .json(new ApiResponse(201, checkUser, "Profile fetched successfully"));
});

const getUserId = asyncHandler(async (req, res) => {
  let _id  = req.params.user_id;

  if(!_id) {
    throw new ApiError(404, "Page not found");
  }
  
  const checkUser = await userModel.findById({ _id }).select(" -password ");
  if(!checkUser) {
    throw new ApiError(400, "User does not exist");
  }
  res.status(201).json(new ApiResponse(201, checkUser, "User fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {});

**/

const updateUserId = asyncHandler(async (req, res) => {
  let id = req.params.user_id;
  let { user_Name, email, password, profile_Image } = req.body;

  if (!id) {
    throw new ApiError(404, "Page not found");
  }

  const checkUser = await userModel.findById({ _id: id }).select(" -password ");
  if (!checkUser) {
    throw new ApiError(400, "User does not exist");
  }

  let newPassword = password
    ? await bcrypt.hash(password, 10)
    : checkUser.password;

  const updatedUser = await userModel.findByIdAndUpdate(id, {
    user_Name: user_Name || checkUser.user_Name,
    password: newPassword || checkUser.password,
    email: email || checkUser.email,
    profile_Image: profile_Image || checkUser.profile_Image,
  }).select(" -password ");

  if (!updatedUser) {
    throw new ApiError(400, "Something went wrong while updating the user");
  }

  let token = generateToken(updatedUser);
  res.cookie("token", token);

  res.status(201).json(new ApiResponse(201, updatedUser, "User updated successfully"));
});

export {
  signUpUser,
  signUpSeller,
  signUpVet,
  loginUser,
  logoutUser,
  // getUser,
  // getUserId,
  updateUserId,
  // refreshAccessToken,
};
