import jwt from "jsonwebtoken";

export const verifyToken = (token: string, secret: string) => {
  const decoded = jwt.verify(token, secret);
  return decoded;
};
