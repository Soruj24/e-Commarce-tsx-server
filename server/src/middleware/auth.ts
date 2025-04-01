import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import createHttpError from "http-errors";
import { jwtAccessKey } from "../secret";

// Extend Request type to include user data
interface AuthenticatedRequest extends Request {
    user?: {
        _id: string;
        email: string;
        isAdmin: boolean;
    };
}

// Middleware to check if the user is logged in
export const isLoggedIn = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies.accessToken;
        if (!token) {
            throw createHttpError(401, "Please login first");
        }


        if (!jwtAccessKey) {
            throw createHttpError(500, "JWT access key is not configured");
        }
        const decoded = jwt.verify(token, jwtAccessKey) as JwtPayload;

        if (!decoded || !decoded.userExists) {
            throw createHttpError(401, "User not verified");
        }

        req.user = decoded.userExists; // Attach user data to request
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware to check if the user is logged out
export const isLoggedOut = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies.accessToken;
        if (token) {
            try {
                if (!jwtAccessKey) {
                    throw createHttpError(500, "JWT access key is not configured");
                }
                // Verify the token to check if the user is logged in
                const decoded = jwt.verify(token, jwtAccessKey) as JwtPayload;
                if (decoded) {
                    throw createHttpError(400, "User is already logged in.");
                }
            } catch (error) {
                next(error);
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

// Middleware to check if the user is an admin
export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
        if (!req.user?.isAdmin) {
            throw createHttpError(403, "You are not an admin");
        }
        next();
    } catch (error) {
        next(error);
    }
};
