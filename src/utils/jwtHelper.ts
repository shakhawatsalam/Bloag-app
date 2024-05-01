import jwt, { Secret } from "jsonwebtoken";
import config from "../config";
import { createLanguageService } from "typescript";

const generateToken = async (
  { userId }: { userId: number },
  secret: Secret
) => {
  const token = jwt.sign(
    {
      userId,
    },
    secret,
    { expiresIn: "1d" }
  );
  return token;
};

const getUserInfoFromToken = async (token: string) => {
  try {
    const userData = (await jwt.verify(token, config.jwt.secret as string)) as {
      userId: number;
    };

    return userData;
  } catch (err) {
    return null;
  }
};

export const jwtHelper = {
  generateToken,
  getUserInfoFromToken,
};
