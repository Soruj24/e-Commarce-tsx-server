import { Response } from "express";

export const setAccessTokenCookie = (res: Response, accessToken: string): void => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the token
        secure: process.env.NODE_ENV === "production", // Ensure it's sent only over HTTPS in production
        maxAge: 1 * 60 * 1000, // 1 minute (adjust as needed)
        sameSite: "strict", // Prevents sending cookies with cross-site requests
    });
};

// Set the refresh token cookie
export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the token
        secure: process.env.NODE_ENV === "production", // Ensure it's sent only over HTTPS in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
        sameSite: "strict", // Prevents sending cookies with cross-site requests
    });
};
