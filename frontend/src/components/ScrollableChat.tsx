import { ChatState } from "../Context/ChatProvider";
// Ensure to install react-scrollable-feed: npm i react-scrollable-feed (I missed adding this to install list, but I will assume user or I add it)
// Creating a simple map logic instead if dependency missing is safer, but user asked for auto-scroll. 
// I will just use a div with auto-scroll logic or assume I can install it.
// I'll stick to simple map and ref for scrolling or just standard overflow-y-auto for now to avoid package issues.
// Wait, "Auto-scroll to latest message" is a requirement.
// I'll use a manual scroll effect or just `react-scrollable-feed` if I install it. 
// I'll add `react-scrollable-feed` to install list later or just implement manual scroll.
// Implementation check: I ran `npm install ...` earlier without it.
// I will implement a custom scrollable component to be safe.

import { useEffect, useRef } from "react";

const ScrollableChat = ({ messages }: { messages: any[] }) => {
    const { user } = ChatState();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const isSameSender = (messages: any[], m: any, i: number, userId: string) => {
        return (
            i < messages.length - 1 &&
            (messages[i + 1].sender._id !== m.sender._id ||
                messages[i + 1].sender._id === undefined) &&
            messages[i].sender._id !== userId
        );
    };

    const isLastMessage = (messages: any[], i: number, userId: string) => {
        return (
            i === messages.length - 1 &&
            messages[messages.length - 1].sender._id !== userId &&
            messages[messages.length - 1].sender._id
        );
    };

    const isSameSenderMargin = (messages: any[], m: any, i: number, userId: string) => {
        if (
            i < messages.length - 1 &&
            messages[i + 1].sender._id === m.sender._id &&
            messages[i].sender._id !== userId
        )
            return 33;
        else if (
            (i < messages.length - 1 &&
                messages[i + 1].sender._id !== m.sender._id &&
                messages[i].sender._id !== userId) ||
            (i === messages.length - 1 && messages[i].sender._id !== userId)
        )
            return 0;
        else return "auto";
    };

    return (
        <div className="overflow-y-auto h-full px-2 custom-scrollbar">
            {messages &&
                messages.map((m, i) => (
                    <div className="flex" key={m._id}>
                        {(isSameSender(messages, m, i, user._id) ||
                            isLastMessage(messages, i, user._id)) && (
                                <div className="w-8 h-8 mr-1 cursor-pointer mt-2" title={m.sender.name}>
                                    <img src={m.sender.pic} className="rounded-full w-full h-full object-cover" />
                                </div>
                            )}
                        <span
                            className={`${m.sender._id === user._id ? "bg-blue-100 dark:bg-indigo-900 dark:text-gray-100" : "bg-green-100 dark:bg-green-900 dark:text-gray-100"
                                } rounded-2xl px-4 py-2 max-w-[75%] mb-1 mt-1 text-sm`}
                            style={{
                                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                                marginTop: isSameSender(messages, m, i, user._id) ? 3 : 10,
                            }}
                        >
                            {m.content}
                        </span>
                    </div>
                ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ScrollableChat;
