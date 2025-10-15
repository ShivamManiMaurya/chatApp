import express, { json } from "express";
import env from "dotenv";
import cookieParser from "cookie-parser";

// routes
import authRoutes from "./routes/auth.route.js";
import msgRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";

env.config();

const app = express();

const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json({ limit: "5mb" })); // req.body
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/message", msgRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("server started at port - ", PORT);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB: ", error);
    process.exit(1);
  });
