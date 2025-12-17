import { ChatState } from "../Context/ChatProvider";
import SingleChat from "./SingleChat";

const ChatBox = ({ fetchAgain, setFetchAgain }: { fetchAgain: boolean, setFetchAgain: any }) => {
    const { selectedChat } = ChatState();

    return (
        <div
            className={`${selectedChat ? "flex" : "hidden"
                } md:flex items-center flex-col p-3 bg-white w-full md:w-2/3 rounded-lg border border-gray-200`}
        >
            <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        </div>
    );
};

export default ChatBox;
