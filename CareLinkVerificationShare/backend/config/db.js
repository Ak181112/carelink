const mongoose = require("mongoose");
const dns = require("dns").promises;

function maskMongoUri(uri) {
  if (!uri) return "<missing>";
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)([^:/?#]+):([^@]+)@/i, "$1$2:***@");
}

async function validateMongoUri(uri) {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Add it to backend/.env. Use mongodb://... for local MongoDB or mongodb+srv://... for MongoDB Atlas."
    );
  }

  if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
    throw new Error(
      `Invalid MONGODB_URI scheme: ${maskMongoUri(uri)}. Expected mongodb:// or mongodb+srv://.`
    );
  }

  if (/^mongodb\+srv:\/\//i.test(uri)) {
    let parsed;
    try {
      parsed = new URL(uri);
    } catch {
      throw new Error("MONGODB_URI is not a valid mongodb+srv:// URL.");
    }

    const hostname = parsed.hostname;
    if (!hostname) {
      throw new Error("MONGODB_URI does not contain a valid Atlas hostname.");
    }

    try {
      const records = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
      if (!records.length) {
        throw new Error("No SRV records were returned.");
      }
    } catch (error) {
      const detail = error?.code ? `${error.code}: ${error.message}` : error.message;
      throw new Error(
        `MongoDB Atlas SRV DNS lookup failed for ${hostname}. ${detail}. ` +
          `Copy a fresh URI from Atlas (Connect -> Drivers -> Node.js) and test ` +
          `Resolve-DnsName -Type SRV _mongodb._tcp.${hostname} in PowerShell. ` +
          `If that lookup also fails, check your DNS/VPN/firewall settings.`
      );
    }
  }
}

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    await validateMongoUri(uri);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exitCode = 1;
    throw error;
  }
};

module.exports = connectDB;
