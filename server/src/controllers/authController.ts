import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { successResponse } from "./responesController";
import User from "../models/User";
import { createJSONWebToken } from "../helper/jsonwebtoken";
import { setAccessTokenCookie, setRefreshTokenCookie } from "../helper/cookie";
import { jwtAccessKey, jwtRefreshKey } from "../secret";

 

export const handelLogIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (!userExists) {
            return res.status(404).json({
                message: "User does not exist with this email",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, userExists.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Password does not match",
            });
        }

        // Generate tokens
        if (!jwtAccessKey || !jwtRefreshKey) {
            throw new Error("JWT keys are not defined");
        }
        const accessToken = createJSONWebToken({ userId: userExists._id }, jwtAccessKey, "1m");
        const refreshToken = createJSONWebToken({ userId: userExists._id }, jwtRefreshKey, "7d");

        setAccessTokenCookie(res, accessToken);
        setRefreshTokenCookie(res, refreshToken);

        // Convert to object & remove sensitive data
        const user = userExists.toObject();
        delete (user as { password?: string }).password;

        return successResponse(res, {
            statusCode: 200,
            message: "User logged in successfully",
            payload: {
                user: {
                    ...user,
                    accessToken,
                    refreshToken,
                },
            },
        });

    } catch (error) {
        next(error);
    }
};

export const handelRefreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;
        if (!oldRefreshToken) {
            return res.status(401).json({
                message: "Refresh token not found",
            });
        }

        if (!jwtRefreshKey) {
            return res.status(500).json({
                message: "JWT refresh key is not defined",
            });
        }
        const decoded = jwt.verify(oldRefreshToken, jwtRefreshKey);
        if (typeof decoded !== "object" || !decoded || !("userId" in decoded)) {
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                message: "Invalid refresh token",
            });
        }

        // Generate a new access token
        if (!jwtAccessKey) {
            throw new Error("JWT access key is not defined");
        }
        const accessToken = createJSONWebToken({ userId: decoded.userId }, jwtAccessKey, "1m");
        setAccessTokenCookie(res, accessToken);

        return successResponse(res, {
            statusCode: 200,
            message: "New access token created successfully",
            payload: { accessToken },
        });

    } catch (error) {
        next(error);
    }
};

export const handelProtected = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            return res.status(401).json({
                message: "Access token not found",
            });
        }

        if (!jwtAccessKey) {
            return res.status(500).json({
                message: "JWT access key is not defined",
            });
        }
        const decoded = jwt.verify(accessToken, jwtAccessKey) as jwt.JwtPayload;
        if (!decoded || typeof decoded !== "object" || !decoded.userId) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return successResponse(res, {
            statusCode: 200,
            message: "Protected route accessed successfully",
            payload: { user },
        });

    } catch (error) {
        next(error);
    }
};

export const handelLogOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return successResponse(res, {
            statusCode: 200,
            message: "User logged out successfully",
        });

    } catch (error) {
        next(error);
    }
};
