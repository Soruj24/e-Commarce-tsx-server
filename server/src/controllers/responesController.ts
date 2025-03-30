import { Response } from "express";
import { ErrorResponseProps, SuccessResponseProps } from "../types";



export const errorResponse = (
    res: Response,
    { statusCode = 500, message = "Internal Error" }: ErrorResponseProps
): Response => {
    return res.status(statusCode).json({
        success: false,
        message: message,
    });
};

export const successResponse = (
    res: Response,
    { statusCode = 200, message = "Success", payload = {} }: SuccessResponseProps
): Response => {
    return res.status(statusCode).json({
        success: true,
        message: message,
        payload,
    });
};
