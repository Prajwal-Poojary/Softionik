import { ChatState } from "../Context/ChatProvider";
import Navbar from "../components/Navbar";
import ChatSidebar from "../components/ChatSidebar";
import ChatArea from "../components/ChatArea";
import InfoPanel from "../components/InfoPanel";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

const ChatPage = () => {
    const { user, selectedChat } = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="w-full h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-900 transition-colors duration-200">
            {user && <Navbar />}
            <div className="flex flex-1 w-full overflow-hidden relative">
                {user && <ChatSidebar fetchAgain={fetchAgain} />}

                {user && (
                    <div className={`flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-gray-950 transition-all duration-300 ${!selectedChat ? 'hidden md:flex' : 'flex absolute md:relative inset-0 z-20 md:z-0'}`}>
                        <ChatArea
                            fetchAgain={fetchAgain}
                            setFetchAgain={setFetchAgain}
                            setShowInfo={setShowInfo}
                        />
                    </div>
                )}

                <AnimatePresence>
                    {showInfo && selectedChat && (
                        <InfoPanel onClose={() => setShowInfo(false)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ChatPage;
