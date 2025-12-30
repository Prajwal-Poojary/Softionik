
import { useState, useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import { toast } from "react-toastify";
import axios from "axios";
import { Search, Plus } from "lucide-react";
import { motion } from "framer-motion";

const ChatSidebar = ({ fetchAgain }: { fetchAgain: boolean }) => {
    const [loggedUser, setLoggedUser] = useState<any>();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
    const [searchTerm, setSearchTerm] = useState("");

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get("/api/chat", config);
            setChats(data);
        } catch (error) {
            toast.error("Failed to Load the chats");
        }
    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo") || "null"));
        fetchChats();
    }, [fetchAgain]);

    const getSender = (loggedUser: any, users: any[]) => {
        if (!users || !loggedUser) return "";
        return users[0]?._id === loggedUser?._id ? users[1]?.name : users[0]?.name;
    };

    const filteredChats = chats?.filter((chat: any) => {
        if (!chat) return false;

        // Handle group chats
        if (chat.isGroupChat) {
            return chat.chatName.toLowerCase().includes(searchTerm.toLowerCase());
        }

        // Handle 1-on-1 chats
        const senderName = getSender(loggedUser, chat.users);
        return senderName ? senderName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    });



    return (
        <div className={`flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-full md:w-80 lg:w-96 flex-shrink-0 transition-all duration-300 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            {/* Header */}
            <div className="px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 z-10 transition-colors duration-200">
                <h1 className="font-bold text-xl text-gray-800 dark:text-gray-100 tracking-tight">Chats</h1>

                <button
                    onClick={() => toast.info("Create Group functionality here")}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
                    title="New Group"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="p-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-full focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-700 transition-all text-sm dark:text-gray-200 dark:placeholder-gray-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1 custom-scrollbar">
                {filteredChats ? (
                    filteredChats.map((chat: any) => (
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedChat(chat)}
                            key={chat?._id}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent ${selectedChat === chat
                                ? "bg-indigo-50 dark:bg-gray-800 border-indigo-100 dark:border-gray-700 shadow-sm"
                                : "hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-100 dark:hover:border-gray-700"
                                }`}
                        >
                            {/* Avatar */}
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium text-white shadow-sm ${chat.isGroupChat ? 'bg-indigo-500' : 'bg- emerald-500'}`}>
                                    {chat.isGroupChat ? "G" : getSender(loggedUser, chat.users).charAt(0).toUpperCase()}
                                </div>
                                {/* Online Status Dot (Mock) */}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`text-sm font-semibold truncate ${selectedChat === chat ? 'text-indigo-900 dark:text-indigo-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                        {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                                    </h3>
                                    {chat.latestMessage && (
                                        <span className="text-xs text-gray-400">
                                            {new Date(chat.latestMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>

                                <p className={`text-xs truncate ${selectedChat === chat ? 'text-indigo-700 font-medium' : 'text-gray-500'}`}>
                                    {chat.latestMessage ? (
                                        <>
                                            <span className="font-semibold text-gray-600 mr-1">
                                                {chat.latestMessage.sender._id === loggedUser?._id ? "You: " : chat.latestMessage.sender.name + ": "}
                                            </span>
                                            {chat.latestMessage.content}
                                        </>
                                    ) : (
                                        <span className="italic">No messages yet</span>
                                    )}
                                </p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex justify-center mt-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;
