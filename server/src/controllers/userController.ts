import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

const handelUserSignup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
            return;
        }

        // const user = await User.create({
        //     name,
        //     email,
        //     password
        // });

       
        res.status(201).json({
            success: true,
            
        });
    } catch (error) {
        next(error);
    }
};

// Get all users
const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
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
const getUserById = async (req: Request, res: Response, next: NextFunction) => {
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
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
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
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
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
    handelUserSignup,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};