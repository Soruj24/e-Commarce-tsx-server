import express from 'express';
import { handelUserSignup } from '../controllers/userController';
import { Request, Response, NextFunction } from 'express';

const userRouter = express.Router();

userRouter.post('/signup', handelUserSignup);


export default userRouter;