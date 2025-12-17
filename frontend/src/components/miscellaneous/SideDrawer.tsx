import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
// Icons can be used from libraries or emojis for now
// import { BellIcon, ChevronDownIcon } from "@heroicons/react/24/outline"; 

const SideDrawer = () => {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const {
        user,
        setSelectedChat,
        chats,
        setChats,
        notification,
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
            <div className="flex justify-between items-center bg-white w-full p-2 border-b-4 border-gray-100">
                <button
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                >
                    <i className="fas fa-search px-2"></i>
                    <span className="hidden md:flex px-2">Search User</span>
                </button>

                <h2 className="text-2xl font-sans font-bold text-gray-700">Softioik Chat</h2>

                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {/* Notification Bell Placeholder */}
                        <button className="text-2xl">
                            🔔
                            {notification.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs px-1">
                                    {notification.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="relative group">
                        <button className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-md">
                            <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full cursor-pointer" />
                            <span className="text-sm font-medium ml-1">V</span>
                        </button>
                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover:block z-10">
                            <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">My Profile</button>
                            <button
                                onClick={logoutHandler}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {isSearchOpen && (
                <div className="absolute left-0 top-16 bg-white z-10 h-screen w-80 shadow-2xl p-4 transition-transform border-r">
                    <div className="flex pb-2">
                        <input
                            className="border p-2 rounded w-full mr-2"
                            placeholder="Search by name or email"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button onClick={handleSearch} className="bg-gray-200 p-2 rounded hover:bg-gray-300">Go</button>
                    </div>
                    {loading ? (
                        <div>Loading...</div>
                    ) : (
                        <div className="flex flex-col space-y-2 mt-4">
                            {searchResult?.map((user: any) => (
                                <div
                                    key={user._id}
                                    onClick={() => accessChat(user._id)}
                                    className="bg-gray-100 hover:bg-blue-100 cursor-pointer p-2 rounded flex items-center mb-2"
                                >
                                    <img src={user.pic} alt={user.name} className="w-8 h-8 rounded-full mr-2" />
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-xs text-gray-500">Email: {user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {loadingChat && <div className="mt-4 text-center">Opening Chat...</div>}
                </div>
            )}
        </>
    );
};

export default SideDrawer;
