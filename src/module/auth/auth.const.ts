import { CookieOptions } from "express";
import config from "../../config";

export const cookieOptions: CookieOptions = {
  secure: config.node_env === "production",
  httpOnly: true,
  sameSite: config.node_env === "production" ? "none" : "lax",
} as const;
