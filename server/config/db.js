import mongoose from 'mongoose';

export async function connectDB() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw Object.assign(new Error('MONGODB_URI is required to start the server'), {
      status: 500,
    });
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(MONGODB_URI);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);

  return mongoose.connection;
}
