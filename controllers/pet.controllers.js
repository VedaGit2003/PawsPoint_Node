import petModel from "../models/pet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllPets = asyncHandler();
const createPets = asyncHandler();
const getPet = asyncHandler();
const updatePet = asyncHandler();
const deletePet = asyncHandler();
const searchPets = asyncHandler();
const getPetsBySellerId = asyncHandler();

export {
  getAllPets,
  createPets,
  getPet,
  updatePet,
  deletePet,
  searchPets,
  getPetsBySellerId,
};
