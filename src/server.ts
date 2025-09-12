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
    const PORT = process.env.PORT || config.port || 9000;
    server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT} 😎`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
}
main();

process.on("unhandledRejection", (err) => {
  console.error("⚠️ Unhandled rejection:", err);
  if (server) server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught exception:", err);
  process.exit(1);
});
