import app, { io } from "./app";
import mongoose from "mongoose";
import config from "./config";
import seedSuperAdmin from "./DB";
import { Server } from "http";
import { Socket } from "socket.io";

let server: Server;
async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    await seedSuperAdmin();
    io.on("connection", (socket: Socket) => {
      socket.on("join", (userId: string) => {
        socket.join(userId);
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });

    server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port} 😎`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
process.on("unhandledRejection", () => {
  console.log(`⚠️ Unhandled rejection detected`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});

process.on("uncaughtException", () => {
  console.log(`⚠️ Uncaught exception detected`);
  process.exit(1);
});
