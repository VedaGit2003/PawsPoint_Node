import mongoose from "mongoose";

// need some improvements in this schema
const appointmentSchema = new mongoose.Schema(
  {
    // appointment date, description, status, vet_Info, client_Info
    appointment_Date: {
      type: Date,
      required: [true, "Please enter the date of appointment"],
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["None","Pending", "Scheduled", "Completed", "Cancelled"],
      default: "None"
    },
    vet_Info: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Vet information is required"],
    },
    client_info: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Client information is required"],
    },
  },
  {
    timestamps: {
      createdAt: "created_At",
      updatedAt: "updated_At",
    },
  }
);

const appointmentModel = mongoose.model("Appointment", appointmentSchema);
export default appointmentModel;
