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