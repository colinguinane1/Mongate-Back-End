import { Request, Response } from "express";
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
import cors, { CorsOptions } from "cors";
const numberRoutes = require("../routes/NumbersRoute");
const authRoutes = require("../routes/AuthRoute");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json());

const isProduction = process.env.NODE_ENV === "production";

console.log("Production:", isProduction);

// Set allowed origins based on environment
const allowedOrigins = isProduction
  ? [process.env.CORS_ORIGIN]
  : ["*", "http://localhost:3000", "http://10.0.0.232:3000"];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // If no origin (i.e., for non-browser requests like Postman), allow it
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
};

// Apply the CORS middleware to the Express app
app.use(cors(corsOptions));

mongoose
  .connect(process.env.MONGO_URI)
  .then(
    () => console.log("Connected to MongoDB."),
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`Server ready on port ${PORT}.`)
    )
  )
  .catch((err: any) => console.log(err));

app.get("/", (req: Request, res: Response) => res.send("API is running"));

app.use("/api/numbers", numberRoutes);

app.use("/api/auth", authRoutes);

module.exports = app;
