import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { toast } from "react-toastify";
import axios from "axios";

const MyChats = ({ fetchAgain }: { fetchAgain: boolean }) => {
    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

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
        // Logic to get sender name in 1-on-1
        return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
    };

    return (
        <div
            className={`${selectedChat ? "hidden" : "flex"
                } md:flex flex-col items-center p-3 bg-white dark:bg-gray-900 w-full md:w-1/3 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors duration-200`}
        >
            <div className="pb-3 px-3 text-2xl font-sans flex w-full justify-between items-center text-gray-800 dark:text-gray-200">
                My Chats
                <button
                    className="flex text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
                    onClick={() => {
                        // Group Chat Modal Logic Placeholder
                        toast.info("Create Group Chat Feature Here");
                    }}
                >
                    New Group +
                </button>
            </div>
            <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-950 w-full h-full rounded-lg overflow-y-hidden transition-colors duration-200">
                {chats ? (
                    <div className="overflow-y-scroll scrollbar-hide">
                        {chats.map((chat: any) => (
                            <div
                                onClick={() => setSelectedChat(chat)}
                                className={`cursor-pointer px-3 py-2 rounded-lg mb-2 transition-colors ${selectedChat === chat ? "bg-indigo-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                key={chat._id}
                            >
                                <div className="font-medium">
                                    {!chat.isGroupChat
                                        ? getSender(loggedUser, chat.users)
                                        : chat.chatName}
                                </div>
                                {chat.latestMessage && (
                                    <div className="text-xs">
                                        <span className="font-bold">{chat.latestMessage.sender.name}: </span>
                                        {chat.latestMessage.content.length > 50
                                            ? chat.latestMessage.content.substring(0, 51) + "..."
                                            : chat.latestMessage.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    );
};

export default MyChats;
