import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext<any>(null);

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [selectedChat, setSelectedChat] = useState<any>();
    const [user, setUser] = useState<any>();
    const [notification, setNotification] = useState<any[]>([]);
    const [chats, setChats] = useState<any>();

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "null");
        setUser(userInfo);

        if (!userInfo) navigate("/");
    }, [navigate]);

    return (
        <ChatContext.Provider
            value={{
                selectedChat,
                setSelectedChat,
                user,
                setUser,
                notification,
                setNotification,
                chats,
                setChats,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;
