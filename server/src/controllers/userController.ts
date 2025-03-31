import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { v2 as cloudinary } from 'cloudinary';
import { API_KEY, API_SECRET, CLOUD_NAME } from '../secret';

import User from '../models/User';
import { successResponse } from './responesController';

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

const handleUserSignup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { username, email, password } = req.body;

      const image = req.file ? req.file : null;

        if (!image) {
            return next(createHttpError(400, "No image file provided"));
        }
        
        const uploadedImage = await cloudinary.uploader.upload(image.path, {
            folder: 'user_images',
            crop: 'scale',
            public_id: `${Date.now()}`,
            resource_type: 'auto',
        });

        if (!uploadedImage) {
            return next(createHttpError(400, "File upload failed"));
        }

        console.log(uploadedImage, 'uploadedImage');

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            next(createHttpError(400, "Email already Exit",));
        }

        // Create the user
        const user = await User.create({
            username,
            email,
            password,
            image: uploadedImage.secure_url,
        });

        successResponse(res, {
            statusCode: 201,
            message: "User created successfully",
            payload: { user},
        });

    } catch (error) {
        next(error);
    }
};

// Get all users
const handleGetAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// Get single user
const handleGetUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Update user
const handleUpdateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email },
            {
                new: true,
                runValidators: true
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Delete user
const handleDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Export all functions
export {
    handleUserSignup,
    handleGetAllUsers,
    handleGetUserById,
    handleUpdateUser,
    handleDeleteUser
};