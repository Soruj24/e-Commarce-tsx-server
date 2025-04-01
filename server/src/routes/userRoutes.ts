import express from 'express';
import { handleDeleteUser, handleGetAllUsers, handleGetUserById, handleUpdateUser, handleUserSignup } from '../controllers/userController';
import { singupValidate } from '../validator/singupValidation';
import { runValidation } from '../validator';
import { uploadFile } from '../middleware/imageUpload';

const userRouter = express.Router();

userRouter.post('/signup', uploadFile.single('image'), singupValidate, runValidation, handleUserSignup);
userRouter.get('/', handleGetAllUsers)
userRouter.get('/:id', handleGetUserById);
userRouter.delete('/:id', handleDeleteUser);
userRouter.put('/:id',  handleUpdateUser);


export default userRouter;