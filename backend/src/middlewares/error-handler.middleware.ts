import { HttpError } from "@/utils/http-error.util";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
    err: HttpError,
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const statusCode = err.statusCode;
    const message = err.message;

    res.status(statusCode).json({ success: false, message });
};