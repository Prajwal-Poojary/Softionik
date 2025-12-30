import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { toast } from "react-toastify";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000";
var socket: any, selectedChatCompare: any;

const SingleChat = ({ fetchAgain, setFetchAgain }: { fetchAgain: boolean, setFetchAgain: any }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const getSender = (loggedUser: any, users: any[]) => {
        return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            setLoading(true);

            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            );

            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast.error("Failed to Load the Messages");
        }
    };

    const sendMessage = async (event: any) => {
        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                setNewMessage("");
                const { data } = await axios.post(
                    "/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id,
                    },
                    config
                );

                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error) {
                toast.error("Failed to send the Message");
            }
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageRecieved: any) => {
            if (
                !selectedChatCompare || // if chat is not selected or doesn't match current chat
                selectedChatCompare._id !== newMessageRecieved.chat._id
            ) {
                if (!notification.includes(newMessageRecieved)) {
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                setMessages([...messages, newMessageRecieved]);
            }
        });
    });

    const typingHandler = (e: any) => {
        setNewMessage(e.target.value);

        // Typing Indicator Logic
        if (!socketConnected) return;

        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime();
        var timerLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if (timeDiff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timerLength);
    };

    return (
        <div className="flex flex-col w-full h-full p-2">
            <>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 px-2 w-full">
                            <button
                                className="md:hidden p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                                onClick={() => setSelectedChat("")}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div className="text-2xl md:text-3xl px-2 w-full font-sans flex justify-between items-center text-gray-800 dark:text-gray-200">
                                {
                                    !selectedChat.isGroupChat ? (
                                        <>
                                            {getSender(user, selectedChat.users)}
                                            <div onClick={() => setFetchAgain(!fetchAgain)} className="cursor-pointer bg-gray-100 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                <i className="fa fa-eye"></i>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {selectedChat.chatName.toUpperCase()}
                                            <div onClick={() => setFetchAgain(!fetchAgain)} className="cursor-pointer bg-gray-100 dark:bg-gray-800 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                <i className="fa fa-eye"></i>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>

                        <div className="flex flex-col justify-end p-3 bg-gray-100 dark:bg-gray-900 w-full h-full rounded-lg overflow-hidden transition-colors duration-200">
                            {loading ? (
                                <div className="self-center m-auto">
                                    <span className="loading loading-spinner loading-xl"></span>
                                </div>
                            ) : (
                                <div className="messages flex flex-col overflow-y-scroll scrollbar-hide">
                                    <ScrollableChat messages={messages} />
                                </div>
                            )}

                            <div className="mt-3" onKeyDown={sendMessage}>
                                {isTyping ? <div className="text-xs text-gray-500 mb-1">Loading...</div> : <></>}
                                <input
                                    className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 filled-input p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter a message.."
                                    onChange={typingHandler}
                                    value={newMessage}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-3xl pb-3 font-sans text-gray-500 dark:text-gray-400">
                            Click on a user to start chatting
                        </p>
                    </div>
                )}
            </>
        </div>
    );
};

export default SingleChat;
