import { NextFunction, Request, Response } from "express";

export const parseToJsonFormat = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body = JSON.parse(req.body.data);
  next();
};
