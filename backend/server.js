import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import employeeRoutes from "./routes/employeeRoutes.js";
import offboardingRoutes from "./routes/offboardingRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "Employee Offboarding API is running"
    });
});

// Employee APIs
app.use("/api/employees", employeeRoutes);

// Offboarding APIs
app.use("/api/offboardings", offboardingRoutes);

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});