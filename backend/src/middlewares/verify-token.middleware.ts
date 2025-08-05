import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt.util";
import {HttpStatus} from "@/constants/status.constant";
import { createHttpError } from "@/utils/http-error.util";
import { HttpResponse } from "../constants/response-message.constant";

export default function (
    userLevel: "User" | "Admin" | "Therapist"
): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        console.log("Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer")) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.NO_TOKEN)
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.NO_TOKEN)
        }

        const payload = verifyAccessToken(token) as {
            id: string;
            email: string;
            role: "User" | "Admin" | "Therapist"
        };

        if (!payload) {
            console.log("Invalid token payload");
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_EXPIRED)
        }

        if (payload.role !== userLevel) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.UNAUTHORIZED)
        }

        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role,
        }

        console.log("User payload:", req.user);

        req.headers["x-user-payload"] = JSON.stringify(payload);
        next();
    };
}