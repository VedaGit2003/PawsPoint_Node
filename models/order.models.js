import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // reference to the user (customer), array of products, status of product delivery, total_billing
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    cart: [
      {
        itemType: {
          type: String,
          enum: ["Product", "Pet"],
          required: true,
        },
        item: {
          type: mongoose.Schema.ObjectId,
          required: true,
          refPath: "cart.itemType", // Dynamically resolves the reference based on itemType
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
      default: "Pending",
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
    billing_Address: {
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
    // order_Time, shipment_Time, delivery_Time, cancellation_Time, approx_Delivery_Time, max_Delivery_Time
    order_Time: {
      type: Date,
      default: Date.now,
    },
    // all of these will be provided via seller
    shipment_Time: {
      type: Date,
    },
    delivery_Time: {
      type: Date,
    },
    cancellation_Time: {
      type: Date,
    },
    approx_Delivery_Time: {
      type: Date,
    },
    max_Delivery_Time: {
      type: Date,
    },
    // otp, orders_Confirmed, orders_Completed, orders_Cancelled, price, delivery_Cost, total_Order_Value, cancellation_Fees
    otp: {
      type: String,
      default: null,
    },
    orders_Confirmed: {
      type: Boolean,
      default: false,
    },
    orders_Completed: {
      type: Boolean,
      default: false,
    },
    orders_Cancelled: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    delivery_Cost: {
      type: Number,
      default: 0,
    },
    total_Order_Value: {
      type: Number,
      default: 0,
    },
    cancellation_Fees: {
      type: Number,
      default: 0,
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
