import appointmentModel from "../models/appointment.models.js";
import consultancyModel from "../models/vet.consultancy.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/user.models.js";
import OfflineAppointment from "../models/offlineAppointment.model.js";
import { validateVets, validateFields } from "../utils/validateData.js";


//getting all vets controller
const getAllVets=asyncHandler(async(req,res) => {
  const vets=await userModel.find({user_Role:"vet"}).select("-password");
  
  if(!vets){
    return res
    .status(404)
    .json(new ApiError(404, "No vets available right now", "NotFoundError"));
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        vets,
        "Appointment Created Successfully"
      )
    );


})

const createAppointment = asyncHandler(async (req, res) => {
  let {
    appointment_Date,
    description,
    status = "Pending",
    vet_Info,
    client_Info,
  } = req.body;

  // Validate required fields
  validateFields(
    [appointment_Date, vet_Info, client_Info],
    req,
    res
  );

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

const getAppointmentsByVet = asyncHandler(async (req, res) => {
  const vetId = req.user._id; // Vet ID from the request URL
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  // Validate if the vet exists
  const vet = await userModel.findById(vetId);
  if (!vet || vet.user_Role !== "vet") {
    return res
      .status(404)
      .json(new ApiError(404, "Vet not found or invalid role", "ValidationError"));
  }

  // Build query with optional filters
  const queryObject = { vet_Info: vetId };
  if (status) queryObject.status = status; // Filter by status

  // will work on this later on
  // if (startDate || endDate) {
  //   queryObject.appointment_Date = {};
  //   if (startDate) queryObject.appointment_Date.$gte = new Date(startDate);
  //   if (endDate) queryObject.appointment_Date.$lte = new Date(endDate);
  // }

  // Fetch appointments with pagination
  const totalAppointments = await appointmentModel.countDocuments(queryObject);
  const appointments = await appointmentModel
    .find(queryObject)
    .populate("vet_Info", "user_Name email vet_Type vet_Description")
    .populate("client_Info", "user_Name email")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  if (!appointments.length) {
    return res.status(200).json(new ApiResponse(200, [], "No appointments found for this vet"));
  }

  const totalPages = Math.ceil(totalAppointments / limit);
  const pagination = {
    currentPage: parseInt(page),
    totalPages,
    remainingPages: Math.max(totalPages - parseInt(page), 0),
  };

  return res.status(200).json(
    new ApiResponse(200, appointments, "Appointments fetched successfully", pagination)
  );
});

const getAppointmentsByClient = asyncHandler(async (req, res) => {
  const clientId = req.user._id; 
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  // Validate if the client exists
  const client = await userModel.findById(clientId);
  if (!client || client.user_Role !== "consumer") {
    return res
      .status(404)
      .json(new ApiError(404, "Client not found or invalid role", "ValidationError"));
  }

  // Build query with optional filters
  const queryObject = { client_Info: clientId };
  if (status) queryObject.status = status; // Filter by status

  // will work on this later on
  // if (startDate || endDate) {
  //   queryObject.appointment_Date = {};
  //   if (startDate) queryObject.appointment_Date.$gte = new Date(startDate);
  //   if (endDate) queryObject.appointment_Date.$lte = new Date(endDate);
  // }

  // Fetch appointments with pagination
  const totalAppointments = await appointmentModel.countDocuments(queryObject);
  const appointments = await appointmentModel
    .find(queryObject)
    .populate("vet_Info", "user_Name email vet_Type vet_Description")
    .populate("client_Info", "user_Name email")
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  if (!appointments.length) {
    return res.status(200).json(new ApiResponse(200, [], "No appointments found for this client"));
  }

  const totalPages = Math.ceil(totalAppointments / limit);
  const pagination = {
    currentPage: parseInt(page),
    totalPages,
    remainingPages: Math.max(totalPages - parseInt(page), 0),
  };

  return res.status(200).json(
    new ApiResponse(200, appointments, "Appointments fetched successfully", pagination)
  );
});

const approveAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  // const { appointment_Date } = req.body;
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

  /*
    will work on this part later on
    Decisons of vet based on the date and time stuff
  

  // // Validate appointment time
  // if (new Date(appointment_Date) < new Date()) {
  //   return res
  //     .status(400)
  //     .json(
  //       new ApiError(
  //         400,
  //         "Appointment time cannot be in the past.",
  //         "ValidationError"
  //       )
  //     );
  // }

  // // Check vet availability
  // const overlappingAppointments = await appointmentModel.find({
  //   vet_Info: vetId,
  //   appointment_Date: {
  //     $gte: appointment_Date,
  //     $lt: new Date(appointment_Date).setMinutes(
  //       new Date(appointment_Date).getMinutes() + 30
  //     ),
  //   },
  // });
  // if (overlappingAppointments.length > 0) {
  //   return res
  //     .status(400)
  //     .json(
  //       new ApiError(
  //         400,
  //         "The vet is not available at the requested time.",
  //         "ValidationError"
  //       )
  //     );
  // }

  */

  // Update appointment
  appointment.status = "Scheduled";
  // appointment.appointment_Date = appointment_Date;
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

const rejectAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  // const { appointment_Date } = req.body;
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
          "Only vets can cancel appointments.",
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
          "You are not authorized to cancel this appointment.",
          "AuthorizationError"
        )
      );
  }

  /*
    will work on this part later on
    Decisons of vet based on the date and time stuff
  

  // // Validate appointment time
  // if (new Date(appointment_Date) < new Date()) {
  //   return res
  //     .status(400)
  //     .json(
  //       new ApiError(
  //         400,
  //         "Appointment time cannot be in the past.",
  //         "ValidationError"
  //       )
  //     );
  // }

  // // Check vet availability
  // const overlappingAppointments = await appointmentModel.find({
  //   vet_Info: vetId,
  //   appointment_Date: {
  //     $gte: appointment_Date,
  //     $lt: new Date(appointment_Date).setMinutes(
  //       new Date(appointment_Date).getMinutes() + 30
  //     ),
  //   },
  // });
  // if (overlappingAppointments.length > 0) {
  //   return res
  //     .status(400)
  //     .json(
  //       new ApiError(
  //         400,
  //         "The vet is not available at the requested time.",
  //         "ValidationError"
  //       )
  //     );
  // }

  */

  // Update appointment
  appointment.status = "Cancelled";
  // appointment.appointment_Date = appointment_Date;
  await appointment.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appointment,
        "Appointment rejected and cancelled successfully."
      )
    );
});

const completeAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;
  // const { appointment_Date } = req.body;
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
          "Only vets complete appointments.",
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
          "You are not authorized to complete this appointment.",
          "AuthorizationError"
        )
      );
  }

  /*
    will work on this part later on
    Decisons of vet based on the date and time stuff
  

  // // Validate appointment time
  // if (new Date(appointment_Date) < new Date()) {
  //   return res
  //     .status(400)
  //     .json(
  //       new ApiError(
  //         400,
  //         "Appointment time cannot be in the past.",
  //         "ValidationError"
  //       )
  //     );
  // }

  // // Check vet availability
  // const overlappingAppointments = await appointmentModel.find({
  //   vet_Info: vetId,
  //   appointment_Date: {
  //     $gte: appointment_Date,
  //     $lt: new Date(appointment_Date).setMinutes(
  //       new Date(appointment_Date).getMinutes() + 30
  //     ),
  //   },
  // });
  // if (overlappingAppointments.length > 0) {
  //   return res
  //     .status(400)
  //     .json(
  //       new ApiError(
  //         400,
  //         "The vet is not available at the requested time.",
  //         "ValidationError"
  //       )
  //     );
  // }

  */

  // Update appointment
  appointment.status = "Completed";
  // appointment.appointment_Date = appointment_Date;
  await appointment.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, appointment, "Appointment completed successfully.")
    );
});

//====================//online consultancy //===================//



// @desc    Create consultation request
// @route   POST /api/v1/consultancy/request/:vetId
// @access  Private
const requestConsultation = async (req, res) => {
  try {
    const vetId = req.params.vetId;
    const customerId = req.user._id;

    // Check if vet exists
    const vet = await userModel.findById(vetId);
    if (!vet || vet.user_Role !== 'vet') {
      return res.status(404).json({
        success: false,
        message: 'Vet not found'
      });
    }

    // Check for existing request
    const existingRequest = await consultancyModel.findOne({
      vet_info: vetId,
      customer_info: customerId,
      request_from_customer: true
    });

    if (existingRequest) {
    return  res.status(202).json({
        success: true,
        message: 'Request already exists for this vet'
      });
    }

    // Create new consultation request
    const newConsultancy = await consultancyModel.create({
      vet_info: vetId,
      customer_info: customerId,
      request_from_customer: true,
      payment_status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: newConsultancy
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating request'
    });
  }
};

// @desc    Withdraw consultation request
// @route   DELETE /api/v1/consultancy/request/:vetId
// @access  Private
const withdrawRequest = async (req, res) => {
  try {
    const vetId = req.params.vetId;
    const customerId = req.user._id;

    // Find and delete the request
    const deletedRequest = await consultancyModel.findOneAndDelete({
      vet_info: vetId,
      customer_info: customerId,
      request_from_customer: true
    });

    if (!deletedRequest) {
      return res.status(202).json({
        success: true,
        message: 'No active request found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Request withdrawn successfully'
    });
  } catch (error) {
    console.error('Error withdrawing request:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while withdrawing request'
    });
  }
};


const getOnlineAppoinmentByUser = async (req, res) => {
  try {
    const appointments = await consultancyModel.find({
      customer_info: req.user._id,
      request_from_customer: true,
      accept_by_vet: true
    })
    .populate({
      path: 'vet_info',
      select: '-password -__v -createdAt -updatedAt' // Exclude sensitive fields
    })
    .select('-__v') // Exclude version key from main document
    .sort({ created_At: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
      message:"Appointment fetched"
    });

  } catch (error) {
    console.error('Error fetching accepted appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments',
      error
    });
  }
};


const getOnlineAppointmentByVet=async(req,res)=>{
  try{
const appointments = await consultancyModel.find({
      vet_info: req.user._id,
      request_from_customer: true,
    })
    .populate(
      {
      path: 'customer_info',
      select: 'user_Name profile_Image'
      }
    )
    .sort({ created_At: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
      message:"Appointment Fetched"
    });
  }catch(error){
    console.error('Error fetching accepted appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments',
      error
    });
  }
}

const updateOnlineAppointmentByVet = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { accept_by_vet, scheduled_date, scheduled_time } = req.body;

    const appointment = await consultancyModel.findOne({
      _id: appointmentId,
      vet_info: req.user._id, // Optional: ensures the vet owns this appointment
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or unauthorized",
      });
    }

    // Update fields if provided
    if (accept_by_vet !== undefined) appointment.accept_by_vet = accept_by_vet;
    if (scheduled_date) appointment.scheduled_date = scheduled_date;
    if (scheduled_time) appointment.scheduled_time = scheduled_time;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating appointment",
      error,
    });
  }
};


// =====================Offline appointment==============
const createOfflineAppointment = asyncHandler(async (req, res) => {
  const { userId, startDate, endDate, pincode } = req.body;

  // Validate required fields
  if (!userId || !startDate || !endDate || !pincode) {
    return res
      .status(400)
      .json(new ApiError(400, "All fields are required: userId, start_Date, end_Date, pincode"));
  }

  // Validate user existence
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found", "UserNotFound"));
  }

  // Create offline appointment
  const newOfflineAppointment = await OfflineAppointment.create({
    userId: userId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    pincode
  });

  if (!newOfflineAppointment) {
    return res
      .status(500)
      .json(new ApiError(500, "Failed to create offline appointment", "ServerError"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newOfflineAppointment, "Offline appointment created successfully"));
});

const getMyOfflineAppointments = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Validate input
  if (!userId) {
    return res
      .status(400)
      .json(new ApiError(400, "User ID is required"));
  }

  // Check if user exists
  const user = await userModel.findById(userId);
  if (!user) {
    return res
      .status(404)
      .json(new ApiError(404, "User not found"));
  }

  // Fetch all offline appointments for the user
  const appointments = await OfflineAppointment.find({ userId });

  return res
    .status(200)
    .json(new ApiResponse(200, appointments, "Offline appointments retrieved successfully"));
});


const updateOfflineAppointment = asyncHandler(async (req, res) => {
  try {
    const user_Id = req.user._id; // From auth middleware
    const user = await userModel.findById(user_Id);
    const { appointmentId } = req.params;
    const { finalDate, location } = req.body;

    // Check if user is admin
    if (!user || user.user_Role !== "admin") {
      return res.status(403).json({ success: false, message: "User is not Admin" });
    }

    // Validate input
    if (!finalDate || !location) {
      return res.status(400).json(
        new ApiError(400, "Final date and location are required", "ValidationError")
      );
    }

    // Update and return appointment
    const updatedAppointment = await OfflineAppointment.findByIdAndUpdate(
      appointmentId,
      {
        finalDate: new Date(finalDate),
        location,
        confirmation: true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json(
        new ApiError(404, "Offline appointment not found", "NotFoundError")
      );
    }

    res.status(200).json(
      new ApiResponse(200, updatedAppointment, "Offline appointment updated and confirmed successfully")
    );
  } catch (error) {
    console.error("Error updating offline appointment:", error);
    res.status(500).json(new ApiError(500, "Internal Server Error", "ServerError"));
  }
});



const getAllAppointments = asyncHandler(async (req, res) => {
  try {
    const user_Id = req.user._id; // From auth middleware
    const user = await userModel.findById(user_Id);

    if (!user || user.user_Role !== "admin") {
      return res.status(403).json({ success: false, message: "User is not Admin" });
    }

    // Fetch all offline appointments from the database
    const appointments = await OfflineAppointment.find().sort({ final_Date: 1 });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json(new ApiError(404, "No appointments found", "NotFoundError"));
    }

    // Return the list of appointments
    res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched successfully"));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json(new ApiError(500, "Internal Server Error", "ServerError"));
  }
});






export {
  getAllVets,
  createAppointment,
  searchVets,
  getAppointmentsByVet,
  getAppointmentsByClient,
  approveAppointment,
  rejectAppointment,
  completeAppointment,

  //online  consultation
  requestConsultation,
  withdrawRequest,
  getOnlineAppoinmentByUser,
  getOnlineAppointmentByVet,
  updateOnlineAppointmentByVet,
  //offline consultation
  createOfflineAppointment,
  getMyOfflineAppointments,
  getAllAppointments,
  updateOfflineAppointment

};
