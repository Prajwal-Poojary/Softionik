import asyncHandler from 'express-async-handler';
import Story from '../models/storyModel.js';
import User from '../models/userModel.js';

//@description     Get all stories (from friends/chats) - Simplified to all users for now or logical friends
//@route           GET /api/story
//@access          Protected
const getStories = asyncHandler(async (req, res) => {
    // For simplicity in this chat app, we'll fetch stories from all users 
    // In a real app, this would be filtered by "chats" or "friends"

    // Fetch stories created within last 24 hours (handled by MongoDB TTL but good to filter)
    const d = new Date();
    d.setDate(d.getDate() - 1);

    const stories = await Story.find({ createdAt: { $gt: d } })
        .populate("user", "name pic email")
        .sort({ createdAt: -1 });

    res.json(stories);
});

//@description     Create New Story
//@route           POST /api/story
//@access          Protected
const postStory = asyncHandler(async (req, res) => {
    const { content, type } = req.body;

    if (!content) {
        res.status(400);
        throw new Error("Content is required");
    }

    const story = await Story.create({
        user: req.user._id,
        content,
        type,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const fullStory = await Story.findOne({ _id: story._id }).populate("user", "name pic");

    res.status(201).json(fullStory);
});

export { getStories, postStory };
