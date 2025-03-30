import express from 'express';
import { handleUserSignup } from '../controllers/userController';
import { Request, Response, NextFunction } from 'express';
import { singupValidate } from '../validator/singupValidation';
import { runValidation } from '../validator';

const userRouter = express.Router();

userRouter.post('/signup', singupValidate, runValidation, handleUserSignup);


export default userRouter;