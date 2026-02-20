import { useEffect, useState, useRef } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { toast } from "react-toastify";
import io from "socket.io-client";
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, ArrowLeft, CheckCheck, PhoneOff } from "lucide-react";
import { motion } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import CallInterface from "./CallInterface";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

const ENDPOINT = "http://localhost:5000";
// Variable to keep track of socket instance outside of component render cycle if needed, 
// though using useRef or state for socket is better in React.
var socket: any, selectedChatCompare: any;

const ChatArea = ({ fetchAgain, setFetchAgain, setShowInfo }: { fetchAgain: boolean, setFetchAgain: any, setShowInfo: (show: boolean) => void }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [callActive, setCallActive] = useState<{ video: boolean } | false>(false);
    const [incomingCall, setIncomingCall] = useState<any>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            setLoading(true);
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id);
        } catch (error) {
            toast.error("Failed to Load the Messages");
            setLoading(false);
        }
    };

    const sendMessage = async (event: any) => {
        if ((event.key === "Enter" || event.type === "click") && (newMessage || selectedFile)) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        "Content-type": "multipart/form-data",
                        Authorization: `Bearer ${user.token}`,
                    },
                };

                const formData = new FormData();
                formData.append("content", newMessage);
                formData.append("chatId", selectedChat._id);
                if (selectedFile) {
                    formData.append("file", selectedFile);
                }

                setNewMessage("");
                setSelectedFile(null);
                const { data } = await axios.post("/api/message", formData, config);

                socket.emit("new message", data);
                setMessages([...messages, data]);
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    toast.error("Cannot send message. User is blocked.");
                } else {
                    toast.error("Failed to send the Message");
                }
            }
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
        socket.on("callUser", (data: any) => {
            setIncomingCall(data);
        });
    }, []);

    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat]);

    useEffect(() => {
        socket.on("message received", (newMessageRecieved: any) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id) {
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

    const onEmojiClick = (emojiData: EmojiClickData, event: MouseEvent) => {
        setNewMessage((prevInput) => prevInput + emojiData.emoji);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    useEffect(() => {
        const handleStartCall = (e: any) => {
            setCallActive({ video: e.detail.video });
            // Let the effect open CallInterface
        };
        window.addEventListener('start-app-call', handleStartCall);
        return () => window.removeEventListener('start-app-call', handleStartCall);
    }, []);

    const getSenderName = (users: any[]) => {
        // Only valid for 1-on-1 logic usually, assuming user is logged in context
        return users[0]?._id === user?._id ? users[1]?.name : users[0]?.name;
    };

    // Group messages by date
    const groupedMessages: { [key: string]: any[] } = {};
    messages.forEach(msg => {
        const date = new Date(msg.createdAt).toDateString();
        if (!groupedMessages[date]) {
            groupedMessages[date] = [];
        }
        groupedMessages[date].push(msg);
    });

    const getDateLabel = (dateString: string) => {
        const date = new Date(dateString);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return format(date, "MMMM d, yyyy");
    };

    if (!selectedChat) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500 transition-colors duration-200">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Send size={40} className="text-gray-400 dark:text-gray-600 ml-2" />
                </div>
                <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-300">Welcome to Softionik Chat</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Select a conversation from the sidebar to start chatting.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#efeae2] dark:bg-gray-950 relative w-full transition-colors duration-200">
            {incomingCall && !callActive && (
                <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border border-indigo-100 dark:border-gray-800 flex flex-col gap-3 w-72">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
                            {incomingCall.isVideo ? <Video size={20} /> : <Phone size={20} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200">{incomingCall.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Incoming {incomingCall.isVideo ? "Video" : "Audio"} Call...</p>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={() => setCallActive({ video: incomingCall.isVideo || false })}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white chat-button py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => setIncomingCall(null)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white chat-button py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            )}

            {callActive && selectedChat && (
                <CallInterface
                    socket={socket}
                    user={user}
                    targetUser={incomingCall ? { _id: incomingCall.from, name: incomingCall.name } : selectedChat.users.find((u: any) => u._id !== user._id)}
                    isInitiator={!incomingCall}
                    incomingSignal={incomingCall?.signal}
                    isVideo={callActive.video}
                    onClose={async (missed) => {
                        setCallActive(false);
                        setIncomingCall(null);

                        if (missed) {
                            try {
                                const config = {
                                    headers: {
                                        "Content-type": "application/json",
                                        Authorization: `Bearer ${user.token}`,
                                    },
                                };
                                const { data } = await axios.post("/api/message", {
                                    content: "Missed Video Call",
                                    chatId: selectedChat._id,
                                    type: "call_missed"
                                }, config);

                                socket.emit("new message", data);
                                setMessages([...messages, data]);
                            } catch (error) {
                                console.error("Failed to send missed call message");
                            }
                        }
                    }}
                />
            )}

            {/* Header */}
            <div className="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm z-10 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedChat("")}
                        className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => setShowInfo(true)}
                    >
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                            {selectedChat.isGroupChat ? "G" : getSenderName(selectedChat.users).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base">
                                {selectedChat.isGroupChat ? selectedChat.chatName : getSenderName(selectedChat.users)}
                            </h2>
                            { /* Online Mock */}
                            <p className="text-xs text-green-500 font-medium">Online</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    <button
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-full transition-colors hidden md:block"
                        onClick={() => setCallActive({ video: true })}
                    >
                        <Video size={20} />
                    </button>
                    <button
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-full transition-colors hidden md:block"
                        onClick={() => setCallActive({ video: false })}
                    >
                        <Phone size={20} />
                    </button>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden md:block"></div>
                    <button
                        onClick={() => setShowInfo(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-400"
                        title="Chat Info"
                    >
                        <MoreVertical size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://camo.githubusercontent.com/854a93c27d64274c4f8f5a0b6ec36ee1d053cfcd9345ac9c48b08749a923a16e/68747470733a2f2f7765622e77686174736170702e636f6d2f696d672f62672d636861742d74696c652d6461726b5f61346265353132653731393562366237333364393131306234303866303735642e706e67')] bg-repeat opacity-95">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    Object.keys(groupedMessages).map((date) => (
                        <div key={date}>
                            <div className="flex justify-center my-4 sticky top-2 z-0">
                                <span className="bg-white/90 dark:bg-gray-800/90 shadow-sm px-3 py-1 rounded-full text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
                                    {getDateLabel(date)}
                                </span>
                            </div>
                            {groupedMessages[date].map((msg, index) => {
                                const isSender = msg.sender._id === user._id;
                                const isLastInGroup = index === groupedMessages[date].length - 1 || groupedMessages[date][index + 1].sender._id !== msg.sender._id;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={msg._id}
                                        className={`flex w-full ${isLastInGroup ? 'mb-3' : 'mb-1'} ${isSender ? "justify-end" : "justify-start"}`}
                                    >
                                        <div className={`max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm relative shadow-sm ${isSender
                                            ? "bg-[#dcf8c6] dark:bg-indigo-900 text-gray-800 dark:text-gray-100 rounded-br-none"
                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none"
                                            }`}>
                                            {!isSender && selectedChat.isGroupChat && (
                                                <p className="text-xs font-bold text-orange-500 mb-1">
                                                    {msg.sender.name}
                                                </p>
                                            )}
                                            {msg.type === "call_missed" ? (
                                                <div className="flex items-center gap-2 text-red-500 font-medium">
                                                    <div className="bg-red-100 p-2 rounded-full">
                                                        <PhoneOff size={18} />
                                                    </div>
                                                    <span>Missed Call</span>
                                                </div>
                                            ) : (
                                                <p>{msg.content}</p>
                                            )}
                                            {msg.fileUrl && (
                                                <div className="mt-2">
                                                    {msg.fileType && msg.fileType.startsWith("image/") ? (
                                                        <img
                                                            src={`http://localhost:5000${msg.fileUrl}`}
                                                            alt="attachment"
                                                            className="max-w-full h-auto rounded-lg border border-gray-200 cursor-pointer"
                                                            onClick={() => window.open(`http://localhost:5000${msg.fileUrl}`, '_blank')}
                                                        />
                                                    ) : (
                                                        <a
                                                            href={`http://localhost:5000${msg.fileUrl}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors text-indigo-600"
                                                        >
                                                            <Paperclip size={18} />
                                                            <span className="truncate max-w-[200px]">{msg.fileName || "Download Attachment"}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                            <div className={`flex items-center justify-end gap-1 mt-1 ${isSender ? "text-green-800/60 dark:text-indigo-300/60" : "text-gray-400"}`}>
                                                <span className="text-[10px]">
                                                    {format(new Date(msg.createdAt), "h:mm a")}
                                                </span>
                                                {isSender && (
                                                    <CheckCheck size={14} />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {selectedFile && (
                <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between z-10 transition-colors duration-200">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Paperclip size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{selectedFile.name}</span>
                    </div>
                    <button
                        onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                    >
                        Remove
                    </button>
                </div>
            )}
            <div className="p-3 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
                {showEmojiPicker && (
                    <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-lg overflow-hidden" ref={emojiPickerRef}>
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                )}

                {/* Check if Blocked */}
                {!selectedChat.isGroupChat && user?.blockedUsers?.includes(selectedChat.users.find((u: any) => u._id !== user._id)?._id) ? (
                    <div className="flex items-center justify-center p-2 text-sm text-gray-500 font-medium bg-white dark:bg-gray-800 rounded-lg">
                        You have blocked this contact. Unblock them to send a message.
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                        <button
                            className={`p-2 transition-colors ${showEmojiPicker ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile size={24} />
                        </button>
                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip size={24} />
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setSelectedFile(e.target.files[0]);
                                }
                            }}
                        />
                        <input
                            type="text"
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-700 dark:text-gray-200 placeholder-gray-400 px-2"
                            placeholder="Type a message..."
                            onChange={typingHandler}
                            value={newMessage}
                            onKeyDown={(e) => sendMessage(e)}
                        />
                        <button
                            onClick={sendMessage}
                            className={`p-2 rounded-full transition-all ${newMessage || selectedFile ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}`}
                        >
                            <Send size={20} className={newMessage ? 'ml-0.5' : ''} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatArea;
