import Adopt from "../models/adopt.model.js"; // Make sure the path is correct
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new pet adoption request
const createAdoptPet = asyncHandler(async (req, res) => {
  const { name, phone, address, pincode, petType } = req.body;

  // Validate required fields
  if (!name || !phone || !address || !pincode || !petType) {
    return res.status(400).json(
      new ApiError(400, "All fields are required", "ValidationError")
    );
  }

  // Create the adoption record
  const adoptRequest = await Adopt.create({
    name,
    phone,
    address,
    pincode,
    petType,
  });

  if (!adoptRequest) {
    return res
      .status(500)
      .json(new ApiError(500, "Failed to create adoption request", "ServerError"));
  }

  return res.status(201).json(
    new ApiResponse(201, adoptRequest, "Adoption request submitted successfully")
  );
});

export { createAdoptPet };
