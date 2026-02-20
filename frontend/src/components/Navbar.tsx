
import { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { Search, Bell, User, LogOut, X, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import ProfileModal from "./miscellaneous/ProfileModal";

const Navbar = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const {
        user,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
    } = ChatState();
    const navigate = useNavigate();

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        navigate("/");
    };

    const handleSearch = async () => {
        if (!search) {
            toast.warning("Please enter something in search");
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`/api/user?search=${search}`, config);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast.error("Error Occured!");
            setLoading(false);
        }
    };

    const accessChat = async (userId: string) => {
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`/api/chat`, { userId }, config);

            if (!chats.find((c: any) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setLoadingChat(false);
            setIsSearchOpen(false);
        } catch (error: any) {
            toast.error(error.message);
            setLoadingChat(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-gray-900 h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm transition-colors duration-200">
                {/* Logo & Search Trigger */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            S
                        </div>
                        <span className="text-xl font-bold text-gray-800 dark:text-white tracking-tight hidden md:block">Softionik</span>
                    </div>

                    <div
                        className="flex items-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full px-4 py-2 cursor-pointer w-full md:w-64 gap-2"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <Search size={18} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Search users...</span>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <div className="relative">
                        <button
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative"
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        >
                            <Bell size={20} />
                            {notification.length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotificationOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 z-50 overflow-hidden"
                                >
                                    <h3 className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800">Notifications</h3>
                                    <div className="max-h-72 overflow-y-auto">
                                        {!notification.length && (
                                            <div className="px-4 py-4 text-sm text-gray-500 text-center">No New Messages</div>
                                        )}
                                        {notification.map((notif: any) => (
                                            <div
                                                key={notif._id}
                                                className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-gray-800 cursor-pointer text-sm text-gray-700 dark:text-gray-300 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors"
                                                onClick={() => {
                                                    setSelectedChat(notif.chat);
                                                    setNotification(notification.filter((n: any) => n !== notif));
                                                    setIsNotificationOpen(false);
                                                }}
                                            >
                                                {notif.chat.isGroupChat
                                                    ? `New Message in ${notif.chat.chatName}`
                                                    : `New Message from ${notif.sender.name}`}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">{user.name}</span>
                            <img
                                src={user.pic.startsWith('http') ? user.pic : `http://localhost:5000${user.pic}`}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-1 z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsProfileModalOpen(true);
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                                    >
                                        <User size={16} /> Profile
                                    </button>
                                    <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                        <Settings size={16} /> Settings
                                    </button>
                                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
                                    <button
                                        onClick={logoutHandler}
                                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Global Search Drawer */}
            <AnimatePresence>
                {isSearchOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSearchOpen(false)}
                            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-full w-80 md:w-96 bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col transition-colors duration-200"
                        >
                            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-indigo-600 dark:bg-indigo-700">
                                <h2 className="text-white font-semibold text-lg">Search Users</h2>
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 border-none bg-white dark:bg-gray-800 shadow-sm rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                        placeholder="Name or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                    >
                                        Go
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2">
                                {loading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {searchResult?.map((user: any) => (
                                            <div
                                                key={user._id}
                                                onClick={() => accessChat(user._id)}
                                                className="flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-gray-700"
                                            >
                                                <img
                                                    src={user.pic.startsWith('http') ? user.pic : `http://localhost:5000${user.pic}`}
                                                    alt={user.name}
                                                    className="w-10 h-10 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform"
                                                />
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{user.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {loadingChat && (
                                    <div className="flex items-center justify-center p-4 text-indigo-600 text-sm font-medium">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                        Initializing chat...
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </>
    );
};

export default Navbar;
