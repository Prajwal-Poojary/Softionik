import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        fileUrl: { type: String, default: "" },
        fileType: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
        fileType: { type: String, default: "" },
        fileName: { type: String, default: "" },
        type: { type: String, default: "text" }, // text, image, call_missed, call_started, call_ended
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
