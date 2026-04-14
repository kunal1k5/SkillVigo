import mongoose from 'mongoose';

let connectionPromise = null;

function parseTimeout(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getDbTimeoutMs() {
  return parseTimeout(process.env.MONGO_CONNECT_TIMEOUT_MS, 10000);
}

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const timeoutMs = getDbTimeoutMs();

    connectionPromise = mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: timeoutMs,
        connectTimeoutMS: timeoutMs,
        socketTimeoutMS: timeoutMs,
        maxPoolSize: 10,
        family: 4,
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  const connection = await connectionPromise;
  console.log(`MongoDB connected: ${connection.connection.host}`);

  return connection;
};

export default connectDB;
