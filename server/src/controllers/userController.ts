import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { v2 as cloudinary } from 'cloudinary';
import { API_KEY, API_SECRET, CLOUD_NAME } from '../secret';

import User from '../models/User';
import { successResponse } from './responesController';
import mongoose from 'mongoose';
import { findUserById } from '../services/userServices';

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
            payload: { user },
        });

    } catch (error) {
        next(error);
    }
};

// Get all users
const handleGetAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate and parse query parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const searchQuery = req.query.search as string || '';
        const role = req.query.role as string || ''; // Role-based filtering
        const isActive = req.query.isActive as string || ''; // Status filtering

        const filter: any = {};

        if (searchQuery) {
            const searchRegex = new RegExp(searchQuery, 'i');
            filter.$or = [
                { username: { $regex: searchRegex } },
                { email: { $regex: searchRegex } },
                { role: { $regex: searchRegex } }
            ];
        }

        if (role) filter.role = role;
        if (isActive) filter.isActive = isActive === 'true';

        // Sorting options
        const sortBy = req.query.sort as string || 'createdAt';
        const sortOrder = req.query.order === 'desc' ? -1 : 1;
        const sort = { [sortBy]: sortOrder };

        // Execute queries in parallel
        const [users, totalUser] = await Promise.all([
            User.find(filter)
                .select('-password -__v')
                .sort(sort as { [key: string]: 1 | -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter)
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUser / limit);
        const hasNext = page < totalPages;
        const hasPrev = page > 1;

        // Use successResponse format
        successResponse(res, {
            statusCode: 200,
            message: "Users retrieved successfully",
            payload: {
                users,
                count: users.length,
                totalUser,
                pagination: {
                    page,
                    limit,
                    totalPages,
                    hasNext,
                    hasPrev
                }
            },
        });

    } catch (error) {
        next(error);
    }
};


// Get single user
const handleGetUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.params.id;
        await findUserById(userId);

        const user = await User.findById(userId).select('-password -__v');
        if (!user) {
            throw createHttpError(404, "User not found");
        }

        successResponse(res, {
            statusCode: 200,  // Changed from 201 to 200 since this is a GET request
            message: "User retrieved successfully",
            payload: { user },
        });

    } catch (error) {
        next(error);
    }
};


// Update user
const handleUpdateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;

        await findUserById(userId);

        const updateOptions = { new: true, runValidators: true, context: "query" };
        let updates: Record<string, any> = {};

        for (let key in req.body) {
            if (key === "username") {
                updates[key] = req.body[key];
            } else if (key === "email") {
                throw createHttpError(400, "You can't update email");
            }
        }

        if (Object.keys(updates).length === 0) {
            throw createHttpError(400, "No valid fields to update");
        }

        const userUpdate = await User.findByIdAndUpdate(userId, updates, updateOptions);

        if (!userUpdate) {
            throw createHttpError(404, "User not found or update failed");
        }

        successResponse(res, {
            statusCode: 200,
            message: "User updated successfully",
            payload: { userUpdate },
        });

    } catch (error) {
        next(error);
    }
};

// Delete user
const handleDeleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;

        await findUserById(userId);

        const deleteUser = await User.findByIdAndDelete(userId);

        successResponse(res, {
            statusCode: 200,
            message: "User deleted successfully",
            payload: { deleteUser },
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