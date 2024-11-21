import appointmentModel from "../models/appointment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createAppointment = asyncHandler(async (req, res) => {});
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
