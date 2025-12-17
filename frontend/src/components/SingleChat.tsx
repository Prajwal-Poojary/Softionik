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
            {selectedChat ? (
                <>
                    <div className="flex justify-between items-center pb-3 w-full border-b border-gray-200">
                        <button
                            className="md:hidden flex bg-gray-200 p-2 rounded"
                            onClick={() => setSelectedChat("")}
                        >
                            Back
                        </button>
                        <h2 className="text-xl font-medium uppercase px-2">
                            {!selectedChat.isGroupChat ? selectedChat.users[1].name : selectedChat.chatName}
                        </h2>
                        {/* Profile Modal Icon or Group Info Icon */}
                        <div className="bg-gray-200 p-2 rounded-full cursor-pointer">ℹ️</div>
                    </div>

                    <div className="flex flex-col justify-end p-3 bg-gray-100 w-full h-full rounded-lg overflow-y-hidden mt-2">
                        {loading ? (
                            <div className="self-center m-auto text-xl">Loading...</div>
                        ) : (
                            <div className="flex flex-col overflow-y-auto custom-scrollbar relative h-full">
                                <ScrollableChat messages={messages} />
                            </div>
                        )}

                        <div className="mt-3">
                            {isTyping ? <div className="text-xs text-gray-500 mb-1">Loading...</div> : <></>}
                            <input
                                className="w-full bg-gray-200 p-2 rounded-lg outline-none"
                                placeholder="Enter a message.."
                                onChange={typingHandler}
                                value={newMessage}
                                onKeyDown={sendMessage}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <p className="text-3xl font-sans text-gray-500">
                        Click on a user to start chatting
                    </p>
                </div>
            )}
        </div>
    );
};

export default SingleChat;
