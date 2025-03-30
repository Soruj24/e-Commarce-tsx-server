import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter your name'],
        maxLength: [30, 'Name cannot exceed 30 characters']
    }, 
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: {
            validator: (value: string) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);