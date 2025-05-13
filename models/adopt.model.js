import mongoose from "mongoose";

const adoptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Validates a 10-digit number
        },
        message: props => `${props.value} is not a valid phone number!`,
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    pincode: {
      type: Number,
      required: [true, "Pincode is required"],
      validate: {
        validator: function (v) {
          return /^\d{6}$/.test(v.toString()); // Validates a 6-digit pincode
        },
        message: props => `${props.value} is not a valid pincode!`,
      },
    },
    petType: {
      type: String,
      required: [true, "Pet type is required"],
      enum: ["Dog", "Cat", "Bird", "Rabbit", "Other"], // Example options
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Adopt = mongoose.model("Adopt", adoptSchema);
export default Adopt;
