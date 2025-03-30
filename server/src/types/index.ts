export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

 export interface ErrorResponseProps {
    statusCode?: number;
    message?: string;
}

 export interface SuccessResponseProps {
    statusCode?: number;
    message?: string;
    payload?: any;
}