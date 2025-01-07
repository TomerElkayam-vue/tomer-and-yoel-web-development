import jwt from "jsonwebtoken";
import { UserTokenData } from "./user_to_token_data";

export const generateAccessToken = (
  user: UserTokenData,
  accessToken: string,
  expiryTime: string
) => {
  return jwt.sign(user, accessToken, { expiresIn: expiryTime });
};
