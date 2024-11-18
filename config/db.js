import mongoose from "mongoose";
import dotenv from "dotenv/config";

const mongodbUri = `${process.env.MONGODB_URI}/${process.env.DATABASE_NAME}`;

const connectDB = async () => {
    try {
        const connectDB = await mongoose.connect(mongodbUri);
        console.log("MongoDB connected successfully...");
    } catch (error) {
        console.log("MongoDB connection FAILED ", error.message);
        process.exit(1);
    }
}
export default connectDB;
