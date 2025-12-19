import { ChatState } from "../Context/ChatProvider";
import { X, User, Phone, Video, Image, ChevronRight, Verified, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const InfoPanel = ({ onClose }: { onClose: () => void }) => {
    const { selectedChat, user } = ChatState();

    if (!selectedChat) return null;

    const getSender = (loggedUser: any, users: any[]) => {
        return users[0]?._id === loggedUser?._id ? users[1] : users[0];
    };

    const sender = !selectedChat.isGroupChat ? getSender(user, selectedChat.users) : null;

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white border-l border-gray-200 shadow-xl overflow-hidden flex flex-col z-20 shrink-0"
        >
            {/* Header */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100 bg-gray-50/50">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                    <X size={20} />
                </button>
                <h2 className="font-semibold text-gray-700">
                    {selectedChat.isGroupChat ? "Group Info" : "Contact Info"}
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Profile Section */}
                <div className="flex flex-col items-center p-6 border-b border-gray-100 bg-white">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl mb-4 border-4 border-white shadow-lg relative">
                        {selectedChat.isGroupChat ? (
                            "G"
                        ) : (
                            <img
                                src={sender?.pic}
                                alt={sender?.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        )}
                        <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 text-center">
                        {selectedChat.isGroupChat ? selectedChat.chatName : sender?.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {selectedChat.isGroupChat
                            ? `${selectedChat.users.length} members`
                            : sender?.email}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-4 mt-6 w-full justify-center">
                        <button className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors shadow-sm">
                                <Phone size={20} />
                            </div>
                            <span className="text-xs text-indigo-600 font-medium">Audio</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors shadow-sm">
                                <Video size={20} />
                            </div>
                            <span className="text-xs text-indigo-600 font-medium">Video</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 min-w-[60px]">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors shadow-sm">
                                <User size={20} />
                            </div>
                            <span className="text-xs text-indigo-600 font-medium">Profile</span>
                        </button>
                    </div>
                </div>

                {/* About / Description */}
                <div className="p-4 border-b border-gray-100">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedChat.isGroupChat
                            ? "This is a group description placeholder. Add fun details here!"
                            : (sender?.about || "Hey there! I am using Softionik Chat.")}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>Joined {format(new Date(selectedChat.createdAt), 'MMMM yyyy')}</span>
                    </div>
                </div>

                {/* Media, Links, Docs */}
                <div className="p-2 border-b border-gray-100">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="text-gray-400 group-hover:text-indigo-500 transition-colors"><Image size={18} /></div>
                            <span className="text-sm font-medium text-gray-700">Media, Links and Docs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">12</span>
                            <ChevronRight size={16} className="text-gray-300" />
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="text-gray-400 group-hover:text-amber-500 transition-colors"><Verified size={18} /></div>
                            <span className="text-sm font-medium text-gray-700">Starred Messages</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                    </button>
                </div>

                {/* Group Members */}
                {selectedChat.isGroupChat && (
                    <div className="p-4 bg-gray-50/30">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {selectedChat.users.length} Members
                        </h4>
                        <div className="space-y-3">
                            {selectedChat.users.map((u: any) => (
                                <div key={u._id} className="flex items-center gap-3">
                                    <img src={u.pic} className="w-8 h-8 rounded-full" alt={u.name} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                    </div>
                                    {selectedChat.groupAdmin?._id === u._id && (
                                        <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Admin</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="p-4 mt-2 mb-8">
                    <button className="w-full py-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                        <LogOutIcon size={16} />
                        {selectedChat.isGroupChat ? "Exit Group" : "Block User"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const LogOutIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);

export default InfoPanel;
