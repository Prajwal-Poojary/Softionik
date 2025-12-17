import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useState } from "react";

const HomePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("login");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo") || "null");
        if (user) {
            navigate("/chats");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 bg-[url('/background.png')] bg-cover">
            <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
                <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Softioik Chat</h1>
                <div className="flex mb-6 bg-gray-200 p-1 rounded-lg">
                    <button
                        className={`flex-1 py-2 rounded-md font-semibold transition-colors ${activeTab === "login" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                            }`}
                        onClick={() => setActiveTab("login")}
                    >
                        Login
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md font-semibold transition-colors ${activeTab === "signup" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
                            }`}
                        onClick={() => setActiveTab("signup")}
                    >
                        Sign Up
                    </button>
                </div>
                {activeTab === "login" ? <Login /> : <Signup />}
            </div>
        </div>
    );
};

export default HomePage;
