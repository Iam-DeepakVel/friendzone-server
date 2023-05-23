import mongoose from "mongoose";

export const connectDB = async (url: string) => {
  try {
    await mongoose.connect(url);
  } catch (error) {
    console.log(`Error: ${error}`);
    process.exit();
  }
};
