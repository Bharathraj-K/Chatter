import mongoose from "mongoose";

//Function to connect to MongoDB

export const connectDB = async (uri) => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/Chatter`)
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};