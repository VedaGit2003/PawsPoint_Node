import mongoose from "mongoose";
import validator from "validator";

const porductSchema = new mongoose.Schema(
  {
    // name, category, price, description, image
    // need to add trim in all the cases
    name: {
      type: String,
      required: [true, "Please enter the name of your product"],
      trim: true,
    },
    brand: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Please enter the price of your product"],
    },
    description: {
      type: String,
      required: [true, "Please enter the description of your product"],
    },
    category: {
      // will be making it a string [] later point of time
      type: String,
      // [
      //   {
      //     type:mongoose.Schema.ObjectId,
      //     ref:"Category"
      //   }
      // ]
      required: [true, "Please provide the category of your product"],
    }
    ,
    product_Images: {
      type: [String],
      required: [true, "Please provide the images of your product"],
      validate: {
        validator: (value) => {
          return value.every((url) => validator.isURL(url));
        },
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    seller_Info: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: {
      createdAt: "created_At",
      updatedAt: "updated_At",
    },
  }
);

const productModel = mongoose.model("Product", porductSchema);
export default productModel;
