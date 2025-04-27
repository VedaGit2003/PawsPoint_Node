import mongoose from "mongoose";


const consultancySchema=new mongoose.Schema({
   vet_info:{
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Vet information is required"],
   },
   customer_info:{
    type:mongoose.Schema.ObjectId,
    ref:"User",
    required:[true,"Costomer information is required"]
   },
   request_from_customer:{
    type:Boolean,
    default:false
   },
   accept_by_vet:{
    type:Boolean,
    default:false
   },
   payment_id:{
    type:String
   },
   payment_status: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  scheduled_date: {
    type: Date,
    required: false,
  },
  scheduled_time: {
    type: String, // e.g., "14:30" in 24-hour format or "2:30 PM"
    required: false,
  },
},
{
    timestamps: {
      createdAt: "created_At",
      updatedAt: "updated_At",
    },
  }
)

const consultancyModel=mongoose.model('Consultancy',consultancySchema)
export default consultancyModel;