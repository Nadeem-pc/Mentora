import { createLogger, transports, format } from "winston";
import { env } from "./env.config";

const logger = createLogger({
    level: env.NODE_ENV === "production" ? "info" : "debug",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(({ level, message, timestamp }) => {
                    return `[${timestamp}] ${level}: ${message}`;
                })
            ),
        }),

        new transports.File({
            filename: "logs/error.log",
            level: "error",
            format: format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            })
        }),

        new transports.File({
            filename: "logs/combined.log",
            format: format.printf(({ level, message, timestamp }) => {
                return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
            })
        }),
    ],
});

export default logger;