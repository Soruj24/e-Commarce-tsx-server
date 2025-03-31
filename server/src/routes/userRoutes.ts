import express from 'express';
import { handleGetAllUsers, handleGetUserById, handleUserSignup } from '../controllers/userController';
import { singupValidate } from '../validator/singupValidation';
import { runValidation } from '../validator';
import { uploadFile } from '../middleware/imageUpload';

const userRouter = express.Router();

userRouter.post('/signup', uploadFile.single('image'), singupValidate, runValidation, handleUserSignup);
userRouter.get('/', handleGetAllUsers)
userRouter.get('/:id', handleGetUserById);


export default userRouter;