import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import participantRoutes from "./routes/participantRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import cors from "cors";

dotenv.config();

const app: Express = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/expense-tracker";

app.use(express.json());
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow specific methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
    credentials: true, // If you need to send cookies or auth headers
  })
);

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/expenses", expenseRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
