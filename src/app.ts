import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";
import router from "./router";
import notFound from "./middlewire/notFound";
import globalErrorHandler from "./middlewire/globalErrorHandler";
import { Server } from "socket.io";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(cookieParser());
const corsOption = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    config.client_certain_route as string,
  ],
  credentials: true,
};

const io = new Server(createServer(app), {
  cors: corsOption,
});

app.use(cors(corsOption));
app.use("/api/v1", router);

const test = async (req: Request, res: Response) => {
  const message = `server is running on port ${config.port}`;
  res.send(message);
};
app.get("/", test);
app.use(globalErrorHandler);
app.use(notFound);
export { io };
export default app;
