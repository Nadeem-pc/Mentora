import { ZodError, ZodSchema } from "zod";
import formatZodErrors from "../utils/format-zod-error";
import { Request, Response, NextFunction } from "express";
import { HttpStatus } from "../constants/status.constant";
import { HttpResponse } from "./response-message.constant";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error);
        res.status(HttpStatus.BAD_REQUEST).json({
          error: HttpResponse.INVALID_CREDENTIALS,
          details: formatZodErrors(error),
        });
      }
    }
};