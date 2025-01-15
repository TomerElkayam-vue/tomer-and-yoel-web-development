import jwt from "jsonwebtoken";
import { UserTokenData } from "./user_to_token_data";

export const generateRefreshToken = (
  user: UserTokenData,
  refreshTokenSecret: string,
  expiryTime: string
) => {
  const refreshToken = jwt.sign(user, refreshTokenSecret, {
    expiresIn: expiryTime,
  });

  return refreshToken;
};
