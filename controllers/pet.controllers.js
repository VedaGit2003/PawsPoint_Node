import petModel from "../models/pet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateFields, validateSellers } from "../utils/validateData.js";
import userModel from "../models/user.models.js";
import petModels from "../models/pet.models.js";

const getAllPets = asyncHandler();

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
