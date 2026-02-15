import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const importData = async () => {
    try {
        const guestUserExists = await User.findOne({ email: "guest@example.com" });

        if (guestUserExists) {
            console.log("Guest User already exists");
            process.exit();
        }

        const guestUser = {
            name: "Guest User",
            email: "guest@example.com",
            password: "123456", // Will be hashed by pre-save hook
            pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
            isAdmin: false,
        };

        await User.create(guestUser);

        console.log("Guest User Created!");
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
