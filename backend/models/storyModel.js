import mongoose from 'mongoose';

const storySchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, required: true }, // URL to image/video or text
        type: { type: String, default: "image" }, // image, video, text
        viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        expiresAt: { type: Date, default: Date.now, index: { expires: '24h' } } // Auto delete after 24h
    },
    { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);

export default Story;
