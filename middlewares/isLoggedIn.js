import userModel from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const isLoggedIn = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "User not logged in.",
          "AuthorizationError."
        )
      );
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user) {
      return res
      .status(400)
      .json(
        new ApiError(
          400,
          "User not found.",
          "AuthenticationError."
        )
      );
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid token" });
  }
});

export { isLoggedIn };
