require("dotenv").config();

// Fix DNS for networks that don't support SRV records (e.g. university/hotspot DNS)
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CareLink+ server running on port ${PORT}`);
});
