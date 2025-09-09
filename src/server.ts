import app from "./app";
import mongoose from "mongoose";
import config from "./config";
import seedSuperAdmin from "./DB";
import { createServer, Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let server: HttpServer;
let io: SocketIOServer;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    await seedSuperAdmin();

    // initialize http server
    const httpServer = createServer(app);

    // initialize socket server
    io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://localhost:5174",
          config.client_certain_route as string,
        ],
        credentials: true,
      },
    });

    io.on("connection", (socket: Socket) => {
      socket.on("join", (userId: string) => {
        socket.join(userId);
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
      });
    });

    // start server
    server = httpServer.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port} 😎`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
  }
}

main();

// graceful shutdown handlers
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

// export io so it can be used in services
export { io };
