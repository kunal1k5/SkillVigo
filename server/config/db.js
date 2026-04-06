import mongoose from 'mongoose';

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment');
  }

  const connection = await mongoose.connect(MONGO_URI);
  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection;
};

export default connectDB;
