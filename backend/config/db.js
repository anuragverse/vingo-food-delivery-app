import mongoose from "mongoose";

const connectDb = async () => {
  try {
    console.log("MongoDB URL:", process.env.MONGODB_URL);

    await mongoose.connect(process.env.MONGODB_URL);

    console.log("DB connected successfully");
  } catch (error) {
    console.error("DB connection failed:");
    console.error(error);
    process.exit(1);
  }
};

export default connectDb;