import mongoose from "mongoose";
import validator from "validator";

const petSchema = new mongoose.Schema({
    // pet_type, breed_name, image, pet_Description, pet_Age, price and seller_Info
    pet_Type: {
        type: String,
        required: [true, "Please provide the pet type"],
        trim: true,
        enum: ["Dogs", "Cats", "Fish", "Birds"]
    },
    breed_Name: {
        type: String,
        required: [true, "Please provide the breed name"],
        trim: true,
    },
    pet_Images: {
        type: [String],
        required: [true, "Please provide the pet images"],
        validate: {
            validator: (value) => {
                return value.every( url => validator.isURL(url) )
            },
            message: (props) => `${props.value} is not a valid URL`
        }
    },
    pet_Description: {
        type: String,
    },
    pet_Age: {
        type: Number,
        default: 1
    },
    price: {
        type: Number
    },
    seller_Info: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: {
        createdAt: "created_At",
        updatedAt: "updated_At"
    }
});

const petModel = mongoose.model("Pet", petSchema);
export default petModel;