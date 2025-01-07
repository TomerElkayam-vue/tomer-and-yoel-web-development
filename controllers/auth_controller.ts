import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../dtos/user";
import { Request, Response } from "express";
import { UserModel } from "../models/user_model";
import { createNewUser, findUserById } from "../services/user_service";
import { generateAccessToken } from "../utils/auth/generate_access_token";
import { generateRefreshToken } from "../utils/auth/generate_refresh_token";
import { userToTokenData } from "../utils/auth/user_to_token_data";

export const register = async (req: Request, res: Response) => {
  const user: User = req.body;
  try {
    const currentUser = await UserModel.findOne({ email: user.email });

    if (currentUser) {
      throw Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(
      user.password,
      await bcrypt.genSalt()
    );
    await createNewUser({ ...user, password: hashedPassword });

    res.send("User completed registration");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (user == null) {
      throw Error("Invalid Credentials");
    }

    const doesPasswordsMatch = await bcrypt.compare(password, user.password);
    if (!doesPasswordsMatch) {
      throw Error("Invalid Credentials");
    }

    const accessToken = generateAccessToken(
      userToTokenData(user),
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRATION
    );

    const refreshToken = generateRefreshToken(
      userToTokenData(user),
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_EXPIRATION
    );

    user.refreshTokens = user.refreshTokens
      ? [...user.refreshTokens, refreshToken]
      : [refreshToken];
    await user.save();

    res.send({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const getToken = (authorizationHeader: string) => {
  return authorizationHeader?.split(" ")?.[1];
};

export const logout = (req: Request, res: Response) => {
  const refreshToken = getToken(req.headers.authorization);
  if (!refreshToken)
    return res.status(401).send("Refresh token is not provided");

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, userInfo: User) => {
      if (err) {
        return res.status(403).send("Unauthorized");
      }
      const userId = userInfo._id;
      try {
        const user = await findUserById(userId);
        if (user == null) {
          return res.status(403).send("Unauthorized");
        }
        if (!user.refreshTokens.includes(refreshToken)) {
          user.refreshTokens = [];
          await user.save();
          return res.status(403).send("Unauthorized");
        }
        user.refreshTokens = user.refreshTokens.filter(
          (token) => token !== refreshToken
        );
        await user.save();
        res.send("Logged out");
      } catch (err) {
        res.status(403).send(err.message);
      }
    }
  );
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = getToken(req.headers.authorization);
  if (token == null) {
    return res.sendStatus(401).send("Unauthorized");
  }

  jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, userInfo: User) => {
      if (err) return res.status(403).send("Unauthorized");

      const userId = userInfo._id;
      try {
        const user = await UserModel.findById(userId);
        if (user == null) {
          return res.status(403).send("Unauthorized");
        }
        if (!user.refreshTokens.includes(token)) {
          user.refreshTokens = [];
          await user.save();
          return res.status(403).send("Unauthorized");
        }

        const accessToken = generateAccessToken(
          userToTokenData(user),
          process.env.ACCESS_TOKEN_SECRET,
          process.env.ACCESS_TOKEN_EXPIRATION
        );
        const refreshToken = generateRefreshToken(
          userToTokenData(user),
          process.env.REFRESH_TOKEN_SECRET,
          process.env.REFRESH_TOKEN_EXPIRATION
        );

        user.refreshTokens[user.refreshTokens.indexOf(token)] = refreshToken;
        await user.save();
        res.send({ accessToken, refreshToken });
      } catch (err) {
        res.status(403).send(err.message);
      }
    }
  );
};
