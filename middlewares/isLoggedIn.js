import userModel from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    throw new ApiError(400, "User is not logged in");
  }

  let decode = jwt.verify(token, process.env.SECRET_KEY);
  const user = await userModel
    .findById({ _id: decode.id })
    .select(" -password");

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }
  req.user = user;
  next();
});

export { isLoggedIn };
