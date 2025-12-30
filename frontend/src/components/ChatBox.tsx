import { ChatState } from "../Context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }: { fetchAgain: boolean, setFetchAgain: any }) => {
    const { selectedChat } = ChatState();

    return (
        <div
            className={`${selectedChat ? "flex" : "hidden"
                } md:flex items-center flex-col p-3 bg-white dark:bg-gray-900 w-full md:w-2/3 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors duration-200`}
        >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    );
};

export default ChatBox;
