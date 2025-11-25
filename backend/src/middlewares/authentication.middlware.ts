import { HttpResponse } from "@/constants/response-message.constant";
import { HttpStatus } from "@/constants/status.constant";
import User from "@/models/implementation/user.model";
import { createHttpError } from "@/utils/http-error.util";
import { verifyAccessToken } from "@/utils/jwt.util";
import { Request, Response, NextFunction } from "express";


export async function verifyUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED);
    }

    const decode = verifyAccessToken(accessToken);
    if (!decode) {
      throw createHttpError(
        HttpStatus.UNAUTHORIZED,
        HttpResponse.ACCESS_TOKEN_EXPIRED,
      );
    }
    const user = await User.findOne({ email: decode.email });

    if (!user || user.status === "Blocked") {
      throw createHttpError(HttpStatus.FORBIDDEN, HttpResponse.USER_BLOCKED);
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}