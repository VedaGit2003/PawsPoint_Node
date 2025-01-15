import appointmentModel from "../models/appointment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/user.models.js";
import { validateVets } from "../utils/validateData.js";

const createAppointment = asyncHandler(async (req, res) => {
  let { appointment_Date, description, status = "Pending", vet_Info, client_Info } = req.body;

  // Validate required fields
  if (!appointment_Date || !vet_Info || !client_Info) {
    return res
      .status(400)
      .json(new ApiError(400, "All fields are required", "ValidationError"));
  }

  // Validate if the vet exists
  const vet = await userModel.findById(vet_Info._id);
  if (!vet) {
    return res
      .status(404)
      .json(new ApiError(404, "Vet does not exist", "NotFoundError"));
  }

  // Validate if the user is a vet
  validateVets(vet, req, res);

  // Create appointment
  const newAppointment = await appointmentModel.create({
    appointment_Date,
    description,
    status,
    vet_Info,
    client_Info,
  });

  if (!newAppointment) {
    return res
      .status(500)
      .json(new ApiError(500, "Unable to create appointment", "ServerError"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newAppointment, "Appointment Created Successfully"));
});

const searchVets = asyncHandler(async (req, res) => {
  let { page = 1, user_Name, vet_Type, vet_Description, sort } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = 5; // limit vets per page

  const queryObject = {};

  if (user_Name) {
    queryObject.user_Name = new RegExp(user_Name, "i");
  }

  if (vet_Type) {
    queryObject.vet_Type = new RegExp(vet_Type, "i");
  }

  if (vet_Description) {
    queryObject.vet_Description = new RegExp(vet_Description, "i");
  }

  let sortObject = {};
  if (sort) {
    /*
    sorting based on the filteration, like if user wants to getAll products
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

  const vets = await userModel
    .find(queryObject)
    .sort(sortObject)
    .skip(pageNum - 1)
    .limit(limitNum);

  if (vets.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, vets, "No vets available"));
  }

  const totalPages = Math.ceil(totalProducts / limitNum);
  const remainingPages = totalPages - page;

  const pagination = {
    currentPage: page,
    totalPages: totalPages,
    remainingPages: remainingPages > 0 ? remainingPages : 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, vets, "Vets feteched successfully", pagination));
});

const getAppointmentByVet = asyncHandler(async (req, res) => {});
const getAppointmentByClient = asyncHandler(async (req, res) => {});
const approveAppointment = asyncHandler(async (req, res) => {});
const rejectAppointment = asyncHandler(async (req, res) => {});
const completeAppointment = asyncHandler(async (req, res) => {});

export {
  createAppointment,
  searchVets,
  getAppointmentByVet,
  getAppointmentByClient,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
};
