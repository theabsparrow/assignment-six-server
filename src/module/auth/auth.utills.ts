import jwt, { SignOptions } from "jsonwebtoken";

type TJwtPayload = {
  userId: string;
  userRole: string;
};

export const createToken = (
  jwtPayload: TJwtPayload,
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string, secret: string) => {
  const decoded = jwt.verify(token, secret);
  return decoded;
};
