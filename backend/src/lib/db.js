import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("connection host = ", connection.connection.host);
  } catch (error) {
    console.error("Error Connecting MONGODB: ", error);
    process.exit(1); // 1 status code means fail, 0 means success;
  }
};
