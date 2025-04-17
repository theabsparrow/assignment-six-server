import { CookieOptions } from "express";
import config from "../../config";

export const cookieOptions: CookieOptions = {
  secure: config.node_env === "production",
  httpOnly: true,
  sameSite: config.node_env === "production" ? "none" : "lax",
  maxAge: 365 * 24 * 60 * 60 * 1000,
} as const;

export const cookieOptions1: CookieOptions = {
  secure: config.node_env === "production",
  httpOnly: true,
  sameSite: config.node_env === "production" ? "none" : "lax",
  maxAge: 2 * 60 * 1000,
} as const;
