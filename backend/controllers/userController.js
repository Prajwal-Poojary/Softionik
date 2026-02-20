import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import generateToken from '../config/generateToken.js';

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Protected
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

//@description     Register new user
//@route           POST /api/user
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        pic,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("User not found");
    }
});

//@description     Auth the user
//@route           POST /api/user/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error("Invalid Email or Password");
    }
});

//@description     Update user profile
//@route           PUT /api/user/profile
//@access          Protected
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.about = req.body.about || user.about;

        if (req.file) {
            user.pic = `/uploads/${req.file.filename}`;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            pic: updatedUser.pic,
            about: updatedUser.about,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

//@description     Block a user
//@route           PUT /api/user/block
//@access          Protected
const blockUser = asyncHandler(async (req, res) => {
    const { blockId } = req.body;

    if (!blockId) {
        res.status(400);
        throw new Error("Target user ID is required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (!user.blockedUsers) {
        user.blockedUsers = [];
    }

    if (!user.blockedUsers.includes(blockId)) {
        user.blockedUsers.push(blockId);
        await user.save();
    }

    res.status(200).json({ message: "User blocked successfully", blockedUsers: user.blockedUsers });
});

//@description     Unblock a user
//@route           PUT /api/user/unblock
//@access          Protected
const unblockUser = asyncHandler(async (req, res) => {
    const { unblockId } = req.body;

    if (!unblockId) {
        res.status(400);
        throw new Error("Target user ID is required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.blockedUsers && user.blockedUsers.includes(unblockId)) {
        user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== unblockId.toString());
        await user.save();
    }

    res.status(200).json({ message: "User unblocked successfully", blockedUsers: user.blockedUsers });
});

export { allUsers, registerUser, authUser, updateUserProfile, blockUser, unblockUser };
