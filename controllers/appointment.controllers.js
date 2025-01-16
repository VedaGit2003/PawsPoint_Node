import appointmentModel from "../models/appointment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/user.models.js";
import { validateVets } from "../utils/validateData.js";

const createAppointment = asyncHandler(async (req, res) => {
  let {
    appointment_Date,
    description,
    status = "Pending",
    vet_Info,
    client_Info,
  } = req.body;

  // Validate required fields
  if (
    !appointment_Date ||
    !vet_Info ||
    !client_Info ||
    !client_Info._id ||
    !vet_Info._id
  ) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "All fields are required, including vet and client info",
          "ValidationError"
        )
      );
  }

  // Validate if the vet exists
  const vet = await userModel.findById(vet_Info._id);
  if (!vet) {
    return res
      .status(404)
      .json(new ApiError(404, "Vet does not exist", "NotFoundError"));
  }

  // Ensure the vet role is valid
  validateVets(vet, req, res);

  // Validate if the client exists
  const client = await userModel.findById(client_Info._id);
  if (!client) {
    return res
      .status(404)
      .json(new ApiError(404, "Client does not exist", "NotFoundError"));
  }

  // Create the appointment
  const newAppointment = await appointmentModel.create({
    appointment_Date,
    description,
    status,
    vet_Info: vet._id,
    client_Info: client._id,
  });

  if (!newAppointment) {
    return res
      .status(500)
      .json(new ApiError(500, "Unable to create appointment", "ServerError"));
  }

  // Populate vet and client details
  const populatedAppointment = await appointmentModel
    .findById(newAppointment._id)
    .populate("vet_Info", "user_Name email vet_Type vet_Description") // Only include selected fields
    .populate("client_Info", "user_Name email");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        populatedAppointment,
        "Appointment Created Successfully"
      )
    );
});

const searchVets = asyncHandler(async (req, res) => {
  let { page = 1, user_Name, vet_Type, search, sort } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = 5; // limit vets per page

  const queryObject = {};

  if (user_Name) {
    queryObject.user_Name = new RegExp(user_Name, "i");
  }

  if (vet_Type) {
    queryObject.vet_Type = new RegExp(vet_Type, "i");
  }

  if (search) {
    queryObject.vet_Description = new RegExp(search, "i");
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
    .find({ ...queryObject, user_Role: "vet" }) // Ensure only vets are fetched
    .sort(sortObject)
    .skip(pageNum - 1)
    .limit(limitNum);

  if (vets.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No vets available"));
  }

  // console.log(queryObject)

  // getting the total vets based on the filteraton
  const totalVets = await userModel.countDocuments({
    ...queryObject,
    user_Role: "vet",
  });

  const totalPages = Math.ceil(totalVets / limitNum);
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

const approveAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { appointment_Date } = req.body;
  const vetId = req.user._id; // Assuming vet's ID is obtained from JWT token middleware

  // Fetch the appointment
  const appointment = await appointmentModel.findById(appointmentId);
  if (!appointment) {
    return res
      .status(404)
      .json(new ApiError(404, "Appointment does not exist.", "NotFoundError"));
  }

  // Fetch the vet
  const vet = await userModel.findById(vetId);
  if (!vet || vet.user_Role !== "vet") {
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          "Only vets can approve appointments.",
          "AuthorizationError"
        )
      );
  }

  // Check vet authorization
  if (appointment.vet_Info.toString() !== vetId.toString()) {
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          "You are not authorized to approve this appointment.",
          "AuthorizationError"
        )
      );
  }

  // Validate appointment time
  if (new Date(appointment_Date) < new Date()) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Appointment time cannot be in the past.",
          "ValidationError"
        )
      );
  }

  // Check vet availability
  const overlappingAppointments = await appointmentModel.find({
    vet_Info: vetId,
    appointment_Date: {
      $gte: appointment_Date,
      $lt: new Date(appointment_Date).setMinutes(
        new Date(appointment_Date).getMinutes() + 30
      ),
    },
  });
  if (overlappingAppointments.length > 0) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "The vet is not available at the requested time.",
          "ValidationError"
        )
      );
  }

  // Update appointment
  appointment.status = "Scheduled";
  appointment.appointment_Date = appointment_Date;
  await appointment.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointment,
        "Appointment approved and scheduled successfully."
      )
    );
});

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
