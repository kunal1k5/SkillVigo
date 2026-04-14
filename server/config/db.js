import mongoose from 'mongoose';
import dns from 'node:dns';

let connectionPromise = null;

function parseTimeout(value, fallback) {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getDbTimeoutMs() {
  return parseTimeout(process.env.MONGO_CONNECT_TIMEOUT_MS, 10000);
}

function getMongoDnsServers() {
  const configuredServers = `${process.env.MONGO_DNS_SERVERS || ''}`
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (configuredServers.length) {
    return configuredServers;
  }

  return ['8.8.8.8', '1.1.1.1'];
}

function shouldRetryWithCustomDns(error, mongoUri = '') {
  const message = `${error?.message || ''}`;

  return (
    `${mongoUri}`.startsWith('mongodb+srv://') &&
    (error?.code === 'ECONNREFUSED' || message.includes('querySrv ECONNREFUSED'))
  );
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
    const connectOptions = {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
      socketTimeoutMS: timeoutMs,
      maxPoolSize: 10,
      family: 4,
    };

    const connect = () => mongoose.connect(MONGO_URI, connectOptions);

    connectionPromise = mongoose
      .connect(MONGO_URI, connectOptions)
      .catch(async (error) => {
        if (!shouldRetryWithCustomDns(error, MONGO_URI)) {
          throw error;
        }

        const dnsServers = getMongoDnsServers();
        dns.setServers(dnsServers);
        console.warn(
          `Primary DNS SRV lookup failed for MongoDB. Retrying with custom DNS servers: ${dnsServers.join(', ')}`,
        );

        return connect();
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
