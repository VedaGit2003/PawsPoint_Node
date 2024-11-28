import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    user_Name: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "username is required"],
      minLength: [3, "username should be atleast 3 characters long"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email address`,
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: [5, "password should be atleast 5 characters long"],
    },
    user_Role: {
      type: String,
      required: true,
      trim: true,
      enum: ["consumer", "seller", "vet", "admin"], //<- needs to add the properties of the enum
    },
    profile_Image: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    vet_Type: {
      type: String,
      trim: true,
    },
    vet_Description: {
      type: String,
      trim: true,
    },
    orders: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
