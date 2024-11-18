import express from "express";
import dotenv from "dotenv/config";
import connectDB from "./config/db.js";
import indexRouter from "./routes/index.routes.js"
import userRouter from "./routes/user.routes.js";

connectDB();

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);
app.use("/users", userRouter);

const PORT = process.env.PORT;
app.listen(PORT);
