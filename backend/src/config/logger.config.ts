import { createLogger, transports, format } from "winston";
import 'winston-daily-rotate-file';
import { env } from "./env.config";

const combinedRotateTransport = new transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '5m',       
    maxFiles: '14d',     
    level: 'info',
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    )
});

const errorRotateTransport = new transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '5m',       
    maxFiles: '14d',     
    level: 'error',
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    )
});

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
        combinedRotateTransport,
        errorRotateTransport
    ],
});

export default logger;