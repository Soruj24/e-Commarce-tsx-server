import createHttpError from "http-errors";
import mongoose from "mongoose";

import User from "../models/User";

const findUserById = async (userId: string) => {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw createHttpError(400, "Invalid user ID format");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw createHttpError(404, "User not found");
    }
    return user;
}


export {
    findUserById,
}