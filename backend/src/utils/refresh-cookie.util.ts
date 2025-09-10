import { env } from "@/config/env.config";
import { Response } from "express";

export function setCookie(res: Response, refreshToken: string) {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
}

export function deleteCookie(res: Response) {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict'
    })
}