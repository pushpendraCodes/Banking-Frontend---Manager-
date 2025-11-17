import axios from "axios";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";

export default function PasswordPopup({ show, onClose }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const manager = JSON.parse(sessionStorage.getItem("user"))
    if (!show) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();



        try {
            let res = await axios.post(
                `${import.meta.env.VITE_API_URL}/manager/password-change/${manager._id}`,
                {
              
                    oldPassword: password,   // assuming you're passing email from params or props
                    newPassword: confirmPassword,
                }
            );

            if (res.data.success) {
                alert("✅ Password changed successfully!");
                onClose()
                // navigate("/login");
            } else {
                alert(res.data.message || "❌ Failed to change password");
            }
        } catch (error) {
            console.error("Error changing password:", error);
            alert(error.response.data.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0000007a] bg-opacity-40 flex items-center justify-center z-50">
            <div className="relative bg-[#fff9f1] rounded-lg shadow-lg w-[350px] p-6 text-center">

                {/* ✅ Top Circle with Check */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                            w-16 h-16 flex items-center justify-center rounded-full 
                            bg-yellow-400 shadow-[0_0_40px_20px_rgba(250,204,21,0.7)]">
                    <FaCheck className="text-white text-3xl" />
                </div>


                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8">
                    <div className="mb-4 text-left">
                        <label className="block font-medium mb-1">Old Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-200 placeholder-gray-500"
                            placeholder="Enter"
                            required
                        />
                    </div>

                    <div className="mb-6 text-left">
                        <label className="block font-medium mb-1"> New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded bg-gray-200 placeholder-gray-500"
                            placeholder="Enter"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 rounded"
                    >
                        Update
                    </button>
                </form>

                {/* Close button (optional) */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
