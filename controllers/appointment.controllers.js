import appointmentModel from "../models/appointment.models.js";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const createAppointment = asyncHandler();
const searchVets = asyncHandler();
const getAppointmentByVet = asyncHandler();
const getAppointmentByClient = asyncHandler();
const approveAppointment = asyncHandler();
const rejectAppointment = asyncHandler();
const completeAppointment = asyncHandler();

export {
  createAppointment,
  searchVets,
  getAppointmentByVet,
  getAppointmentByClient,
  approveAppointment,
  rejectAppointment,
  completeAppointment,
};
