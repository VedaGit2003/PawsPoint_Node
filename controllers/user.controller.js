import userModel from "../models/user.models.js";
import addressModel from "../models/address.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import {
  validateRoles,
  validateEmails,
  validateFields,
} from "../utils/validateData.js";

const signUpUser = asyncHandler(async (req, res) => {
  let { user_Name, email, password, user_Role, profile_Image, orders } =
    req.body;

  validateFields([user_Name, email, password], req, res);
  validateEmails(email, req, res);

  // Set user_Role to 'vet' if not provided
  if (user_Role) {
    // Ensure valid userRole
    validateRoles(user_Role, req, res);
  } else {
    user_Role = "consumer";
  }

  const existUser = await userModel.findOne({ email });

  if (existUser) {
    return res.json(
      new ApiError(
        400,
        "User with same email already exist",
        "DuplicateError: Email already exists"
      )
    );
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
    return res.json(
      new ApiError(
        500,
        "Something went wrong while registering the user",
        "NetworkError"
      )
    );
  }

  let token = generateToken(newUser);
  res.cookie("token", token);

  const createdUser = await userModel.findById(newUser._id).select("-password");

  return res.json(
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
    user_Role,
  } = req.body;

  // Validate required fields for vet signup
  validateFields(
    [user_Name, email, password, vet_Type, vet_Description],
    req,
    res
  );
  validateEmails(email, req, res);

  // Set user_Role to 'vet' if not provided
  if (user_Role) {
    validateRoles(user_Role, req, res);
  } else {
    user_Role = "vet";
  }

  const userExisted = await userModel.findOne({ email });
  if (userExisted) {
    return res.json(
      new ApiError(
        400,
        "User with the same email already exists",
        "DuplicateError: Email already exists"
      )
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    user_Name,
    user_Role,
    email,
    password: hashedPassword,
    vet_Type,
    vet_Description,
    profile_Image,
  });

  let token = generateToken(newUser);
  res.cookie("token", token);

  const createdUser = await userModel.findById(newUser._id).select("-password");

  return res.json(
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

  validateFields([user_Name, email, password], req, res);
  validateEmails(email, req, res);

  if (user_Role) {
    validateRoles(user_Role, req, res);
  } else {
    user_Role = "seller";
  }

  const existUser = await userModel.findOne({ email });

  if (existUser) {
    return res.json(
      new ApiError(
        400,
        "User with same email already exists",
        "DuplicateError: Email already exists"
      )
    );
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
    return res.json(
      new ApiError(
        500,
        "Something went wrong while registering the user",
        "NetworkError"
      )
    );
  }

  let token = generateToken(newUser);
  res.cookie("token", token);

  const createdUser = await userModel.findById(newUser._id).select("-password");

  return res.json(
    new ApiResponse(
      201,
      { user: createdUser, token },
      "Seller Registered Successfully"
    )
  );
});

const loginUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  validateFields([email, password], req, res);
  validateEmails(email, req, res);

  const checkUser = await userModel.findOne({ email });
  if (!checkUser) {
    return res.json(
      new ApiError(
        400,
        "User does not exist",
        "NotFoundError: User does not exist"
      )
    );
  }

  const checkPassword = await bcrypt.compare(password, checkUser.password);
  if (!checkPassword) {
    return res.json(
      new ApiError(
        400,
        "Incorrect Password!",
        "AuthenticationError: Incorrect Password"
      )
    );
  }

  let token = generateToken(checkUser);
  res.cookie("token", token);
  //remove the password field
  const jsonUser = await userModel
    .findById(checkUser._id)
    .select("-password")
    .lean(); // Converts the Mongoose document to a plain object


  return res.json(
    new ApiResponse(200, { user: jsonUser, token }, "Login Successful")
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("token", "");
  return res.json(
    new ApiResponse(200, "User logged out successfully", "Logout Success")
  );
});

//update user details
const updateUserId = asyncHandler(async (req, res) => {
  let id = req.params.user_id;
  let { user_Name, email, password, profile_Image } = req.body;

  if (!id) {
    return res.json(new ApiError(404, "Page not found", "NotFoundError"));
  }

  const checkUser = await userModel.findById({ _id: id }).select("-password");
  if (!checkUser) {
    return res.json(
      new ApiError(
        400,
        "User does not exist",
        "NotFoundError: User does not exist"
      )
    );
  }

  let newPassword = password
    ? await bcrypt.hash(password, 10)
    : checkUser.password;

  const updatedUser = await userModel
    .findByIdAndUpdate(id, {
      user_Name: user_Name || checkUser.user_Name,
      password: newPassword || checkUser.password,
      email: email || checkUser.email,
      profile_Image: profile_Image || checkUser.profile_Image,
    })
    .select("-password");

  if (!updatedUser) {
    return res.json(
      new ApiError(
        400,
        "Something went wrong while updating the user",
        "NetworkError"
      )
    );
  }

  let token = generateToken(updatedUser);
  res.cookie("token", token);

  return res.json(
    new ApiResponse(200, updatedUser, "User updated successfully")
  );
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


// ====================Address Implementation==================Under Testing============
// Add these new controller functions at the bottom of the file
const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const {
    buildingNo,
    streetAddress,
    city,
    state,
    pin,
    country = "India",
    isPrimary = false,
  } = req.body;

  // Validate required fields
  // validateFields([streetAddress, city, state, pin], req, res);

  // Validate PIN code format
  if (!/^\d{6}$/.test(pin)) {
    return res.json(
      new ApiError(400, "Invalid PIN code format", "ValidationError")
    );
  }

  try {
    // Handle primary address logic
    if (isPrimary) {
      await addressModel.updateOne(
        { userID: userId },
        { $set: { "address.$[].isPrimary": false } }
      );
    }

    // Create new address object
    const newAddress = {
      buildingNo,
      streetAddress,
      city,
      state,
      pin,
      country,
      isPrimary,
    };

    // Update or create address 
    const updatedAddress = await addressModel.findOneAndUpdate(
      { userID: userId },
      { $push: { address: newAddress } },
      { new: true, upsert: true }
    );

    return res.json(
      new ApiResponse(201, updatedAddress, "Address added successfully")
    );
  } catch (error) {
    return res.json(
      new ApiError(500, "Failed to add address", error.message)
    );
  }
});

const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const addressId = req.params.addressId;
  const updates = req.body;

  if (!addressId) {
    return res.json(new ApiError(400, "Address ID is required"));
  }

  try {
    // Handle primary address logic
    if (updates.isPrimary) {
      await addressModel.updateOne(
        { userID: userId },
        { $set: { "address.$[].isPrimary": false } }
      );
    }

    // Update specific address fields
    const updatedAddress = await addressModel.findOneAndUpdate(
      { userID: userId, "address._id": addressId },
      { $set: updates },
      { new: true }
    );

    if (!updatedAddress) {
      return res.json(new ApiError(404, "Address not found"));
    }

    return res.json(
      new ApiResponse(200, updatedAddress, "Address updated successfully")
    );
  } catch (error) {
    return res.json(
      new ApiError(500, "Failed to update address", error.message)
    );
  }
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
  addAddress,
  updateAddress
};
