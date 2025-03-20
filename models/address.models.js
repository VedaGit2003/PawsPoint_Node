import mongoose from "mongoose";

//Schema
const addressSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    address: [{
        buildingNo: {
            type: String,
            trim: true
        },
        streetAddress: {
            type: String,
            trim: true,
            required: [true, 'Street address is required']
        },
        city: {
            type: String,
            trim: true,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            trim: true,
            required: [true, 'State is required']
        },
        pin: {
            type: String,  
            trim: true,
            required: [true, 'PIN code is required'],
            validate: {
                validator: function(v) {
                    return /^\d{6}$/.test(v);
                },
                message: props => `${props.value} is not a valid PIN code!`
            }
        },
        country: {
            type: String,
            trim: true,
            required: [true, 'Country is required'],
            default: 'India'
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }]
}, {
    timestamps: true  
});

//export as Address
const addressModel = mongoose.model("Address", addressSchema);
export default addressModel;