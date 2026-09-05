require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Do not start accepting requests until MongoDB is ready.
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`CareLink+ server running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down CareLink+...`);
      server.close(async () => {
        try {
          const mongoose = require("mongoose");
          await mongoose.connection.close();
        } finally {
          process.exit(0);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("CareLink+ startup failed. Server was not started.");
    process.exit(1);
  }
}

startServer();
