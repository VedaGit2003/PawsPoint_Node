import appointmentModel from "../models/appointment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/user.models.js";

const createAppointment = asyncHandler(async (req, res) => {
  let { appointment_Date, description, status, vet_Info, client_Info } =
    req.body;
  if (!appointment_Date || !vet_Info || !client_Info) {
    return res.json(
      new ApiError(404, "All fields are required", "EmptySpaceError")
    );
  }

  // Vet should exist for the appointment to be scheduled
  // _id will be passed
  const isUser = req.client_Info._id;
  const verifyVet = await userModel.findById({ isUser });

  if (!verifyVet) {
    return res.json(
      new ApiError(
        404,
        "User does not exist",
        "NotFoundError: User does not exist"
      )
    );
  }
  // validating wheather it's actually a vet
  validateVet(verifyVet, req, res);

  const newAppointment = await appointmentModel.create({
    appointment_Date: Date.now(),
    description,
    status: "Pending",
    vet_Info,
    client_Info,
  });

  if (!newAppointment) {
    return res.json(new ApiError(400, "Something went wrong", "NetworkError"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Appointment Created Successfully"));
});

const searchVets = asyncHandler(async (req, res) => {});
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
