import mongoose from "mongoose";
import validator from "validator";

const porductSchema = new mongoose.Schema({
    // name, category, price, description, image
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
        required: [true, "Please enter the description of your product"]
    },
    productImage: {
        type: String,
        required: [true, "Please provide the image of your product"],
        validate: {
            validator: validator.isURL,
            message: (props) => `${props.value} is not a valid URL`
        }
    }

},{
    timestamps: {
        createdAt: "created_At",
        updatedAt: "updated_At"
    }
});

const productModel = mongoose.model("Product", porductSchema);
export default productModel;
