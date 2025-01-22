import express from "express";
import cors from "cors";
import dotenv from "dotenv/config";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import petRouter from "./routes/pet.routes.js";
import orderRouter from "./routes/order.routes.js";
import appointmentRouter from "./routes/appointment.routes.js";
import categoryRouter from "./routes/category.routes.js"

connectDB();

const app = express();

app.set("view engine", "ejs");

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/category",categoryRouter)
app.use("/api/v1/products", productRouter);
app.use("/api/v1/pets", petRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/appointments", appointmentRouter);

const PORT = process.env.PORT;
app.listen(PORT,'0.0.0.0',()=>{
    console.log("Server running on ",PORT)
});
