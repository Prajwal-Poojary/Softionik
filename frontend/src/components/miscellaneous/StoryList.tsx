import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import { toast } from "react-toastify";

const StoryList = () => {
    const { user } = ChatState();
    const [stories, setStories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchStories = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/story", config);
            setStories(data);
            setLoading(false);
        } catch (error) {
            // fail silently or log
            setLoading(false);
        }
    };

    const addStory = async () => {
        const text = prompt("Enter story text (Image upload not implemented for stories yet):");
        if (!text) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post("/api/story", { content: text, type: "text" }, config);
            toast.success("Story added!");
            fetchStories();
        } catch (error) {
            toast.error("Failed to add story");
        }
    };

    useEffect(() => {
        if (user) fetchStories();
    }, [user]);

    // Group stories by user? For now just list them horizontally
    // Ideally we group by user and show ring. 
    // Simplified: Show all recent stories horizontally.

    return (
        <div className="flex gap-4 p-4 overflow-x-auto custom-scrollbar bg-white border-b border-gray-100">
            {/* Add Story */}
            <div className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]" onClick={addStory}>
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-indigo-400 p-1 flex items-center justify-center hover:bg-indigo-50 transition-colors relative">
                    <img src={user.pic} alt="Me" className="w-full h-full rounded-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold">
                        <Plus size={20} />
                    </div>
                </div>
                <span className="text-xs font-medium text-gray-600 truncate w-16 text-center">Your Story</span>
            </div>

            {/* Other Stories */}
            {stories.map((story) => (
                <div key={story._id} className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px]" onClick={() => alert(story.content)}>
                    <div className="w-14 h-14 rounded-full border-2 border-indigo-500 p-0.5">
                        <img src={story.user.pic} alt={story.user.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 truncate w-16 text-center">{story.user.name}</span>
                </div>
            ))}
        </div>
    );
};

export default StoryList;
