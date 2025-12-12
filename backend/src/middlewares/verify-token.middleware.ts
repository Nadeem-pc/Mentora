import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt.util";
import { HttpStatus } from "@/constants/status.constant";
import { createHttpError } from "@/utils/http-error.util";
import { HttpResponse } from "@/constants/response-message.constant";
import User from "@/models/implementation/user.model";

export default function verifyToken() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        const user = await User.findById(payload.id);

        if (!user) {
            throw createHttpError(HttpStatus.UNAUTHORIZED, HttpResponse.USER_NOT_FOUND);
        }

        if (user.status === "Blocked") {
            res.status(HttpStatus.FORBIDDEN).json({ message: HttpResponse.USER_BLOCKED });
        }

        (req as any).user = payload;

        next();
    };
};