require("dotenv").config();
const dns = require("dns").promises;

function mask(uri) {
  return uri?.replace(/(mongodb(?:\+srv)?:\/\/)([^:/?#]+):([^@]+)@/i, "$1$2:***@");
}

async function main() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("MONGODB_URI is missing from backend/.env");
    process.exit(1);
  }

  console.log(`MONGODB_URI: ${mask(uri)}`);

  if (uri.startsWith("mongodb+srv://")) {
    const hostname = new URL(uri).hostname;
    const name = `_mongodb._tcp.${hostname}`;
    console.log(`Checking SRV DNS: ${name}`);

    try {
      const records = await dns.resolveSrv(name);
      console.table(records);
      console.log("MongoDB Atlas SRV DNS: OK");
    } catch (error) {
      console.error(`MongoDB Atlas SRV DNS: FAILED (${error.code || "ERROR"})`);
      console.error(error.message);
      process.exit(2);
    }
  } else if (uri.startsWith("mongodb://")) {
    const hostname = new URL(uri.replace(/^mongodb:\/\//, "http://")).hostname;
    console.log(`Local/standard MongoDB host: ${hostname}`);
    try {
      const addresses = await dns.lookup(hostname);
      console.log(`DNS lookup OK: ${addresses.address}`);
    } catch (error) {
      console.error(`DNS lookup failed (${error.code || "ERROR"}): ${error.message}`);
      process.exit(2);
    }
  } else {
    console.error("Invalid MongoDB URI scheme. Expected mongodb:// or mongodb+srv://");
    process.exit(3);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
