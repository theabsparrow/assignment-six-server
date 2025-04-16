import app from "./app";
import { Server } from "http";
import mongoose from "mongoose";
import config from "./config";

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(config.port, () => {
      console.log(`server is running on port ${config.port} 😎`);
    });
  } catch (error) {
    console.log(error);
  }
}
main();

process.on("unhandledRejection", () => {
  console.log(`unhandled rejection detected 😊`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`uncaughtException detected 😊`);
  process.exit(1);
});
