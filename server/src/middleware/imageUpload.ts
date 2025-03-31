import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';

// Define allowed file types
const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

// Configure storage settings
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!allowedFileTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed.'));
    }
    cb(null, true);
};

// Multer upload configuration
export const uploadFile = multer({
    storage,
    limits: {
        fileSize: 6 * 1024 * 1024,
        files: 1
    },
    fileFilter,
});

// Error handler middleware
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size cannot exceed 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
        });
    }

    next();
};

// Cleanup middleware for failed uploads
export const cleanupOnError = (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        if (res.statusCode >= 400 && req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting failed upload:', err);
            });
        }
    });
    next();
};
