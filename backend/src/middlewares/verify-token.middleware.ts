import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt.util";
import { HttpStatus } from "@/constants/status.constant";
import { createHttpError } from "@/utils/http-error.util";
import { HttpResponse } from "@/constants/response-message.constant";

export default function verifyToken() {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.NO_TOKEN);
        }

        const token = authHeader.split(" ")[1];
        const payload = verifyAccessToken(token) as {
            id: string;
            email: string;
            role: "client" | "admin" | "therapist";
        };

        if (!payload) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.TOKEN_EXPIRED);
        }

        (req as any).user = payload;

        next();
    };
};