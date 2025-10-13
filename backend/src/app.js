import express from "express";
import env from "dotenv";

// routes
import authRoutes from "./routes/auth.route.js";
import msgRoutes from "./routes/message.route.js";

env.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/message", msgRoutes);

app.listen(PORT, () => {
  console.log("server started at port - ", PORT);
});
