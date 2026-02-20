import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';
import Chat from '../models/chatModel.js';

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Create New Message
//@route           POST /api/message
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, type } = req.body;

    if ((!content && !req.file) || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    const chatInstance = await Chat.findById(chatId);
    if (!chatInstance) {
        return res.status(404).json({ message: "Chat not found" });
    }

    if (!chatInstance.isGroupChat) {
        const otherUserId = chatInstance.users.find((u) => u.toString() !== req.user._id.toString());
        if (otherUserId) {
            const otherUser = await User.findById(otherUserId);
            const currentUser = await User.findById(req.user._id);

            const iAmBlocked = otherUser?.blockedUsers?.includes(req.user._id);
            const iBlockedThem = currentUser?.blockedUsers?.includes(otherUserId);

            if (iAmBlocked || iBlockedThem) {
                return res.status(403).json({ message: "Cannot send message. User is blocked." });
            }
        }
    }

    var newMessage = {
        sender: req.user._id,
        content: content || "",
        chat: chatId,
        type: type || "text"
    };

    if (req.file) {
        newMessage.fileUrl = `/uploads/${req.file.filename}`;
        newMessage.fileType = req.file.mimetype;
        newMessage.fileName = req.file.originalname;
    }

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

export { allMessages, sendMessage };
