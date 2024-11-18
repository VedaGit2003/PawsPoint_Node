import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
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
      enum: [] //<- needs to add the properties of the enum
    },
    profile_Image: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: (props) => `${props.value} is not a valid URL`
      }
    }
    ,
    vet_Type: {
      type: String,
      trim: true,
      enum: [] // <- needs to add the properties of the enum
    },
    vet_Description: {
      type: String,
      trim: true,
    },
    numberOfAppointments: {
      type: Number,
      default: 0,
    },
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
