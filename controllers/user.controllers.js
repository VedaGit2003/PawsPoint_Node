import userModel from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signUpUser = asyncHandler(async (req, res) => {});
const loginUser = asyncHandler(async (req, res) => {});
const logoutUser = asyncHandler(async (req, res) => {});
const getUserId = asyncHandler(async (req, res) => {});
const updateUserId = asyncHandler(async (req, res) => {});
const refreshAccessToken = asyncHandler(async (req, res) => {});

export {
  signUpUser,
  loginUser,
  logoutUser,
  getUserId,
  updateUserId,
  refreshAccessToken,
};
