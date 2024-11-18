import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // reference to the user, array of products, status of product delivery, total_billing
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Rejected", "Delivered"],
    },
    total_Bill: {
      type: Number,
      required: true,
    },
    shipping_Address: {
      street: {
        type: String,
        required: [true, "Please enter the street name"],
      },
      building_No: {
        type: Number,
        required: [true, "Please enter the building number"],
      },
      city: {
        type: String,
        required: [true, "Please enter the city name"],
      },
      pincode: {
        type: Number,
        required: [true, "Please enter the pincode"],
      },
      state: {
        type: String,
        required: [true, "Please enter the state"],
      },
      country: {
        type: String,
        required: [true, "Please enter the country"],
      },
    },
    payment_Status: {
      type: String,
      enum: ["Failed", "Successfull", "Processing", "Refund"],
      default: "None",
    },
  },
  {
    timestamps: {
      createdAt: "created_At",
      updatedAt: "updated_At",
    },
  }
);

const orderModel = mongoose.model("Order", orderSchema);
export default orderModel;
