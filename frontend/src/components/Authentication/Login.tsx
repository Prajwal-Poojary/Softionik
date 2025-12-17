import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const submitHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast.warning("Please Fill all the Fields");
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };

            const { data } = await axios.post(
                "/api/user/login",
                { email, password },
                config
            );

            toast.success("Login Successful");
            localStorage.setItem("userInfo", JSON.stringify(data));
            setLoading(false);
            navigate("/chats");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error Occured!");
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <ToastContainer />
            <div className="flex flex-col">
                <label className="font-medium text-gray-700">Email Address</label>
                <input
                    type="email"
                    placeholder="Enter Your Email Address"
                    className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="flex flex-col">
                <label className="font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    placeholder="Enter Password"
                    className="border p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button
                onClick={submitHandler}
                className="bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition disabled:opacity-50"
                disabled={loading}
            >
                {loading ? "Loading..." : "Login"}
            </button>
            <button
                onClick={() => {
                    setEmail("guest@example.com");
                    setPassword("123456");
                }}
                className="bg-red-500 text-white py-2 rounded-md font-bold hover:bg-red-600 transition"
            >
                Get Guest User Credentials
            </button>
        </div>
    );
};

export default Login;
