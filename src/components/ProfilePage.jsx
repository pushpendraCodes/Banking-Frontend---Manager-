import React, { useState } from "react";
// import PasswordPopup from "../components/PasswordPopup"; // ✅ popup import
import { Link } from "react-router-dom";
import PasswordPopup from "../modal/PasswordPopup";
// import PasswordPopup from "../../component/PasswordPopup";

function ProfilePage() {
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);


  const manager = JSON.parse(sessionStorage.getItem("user"))

  return (
    <>
       <div className="bg-[#dc5212] p-3 m-2 rounded-md">
        <h2 className=" text-lg font-bold">
       Profile Page
        </h2>
      </div>

      <div className="flex-1 ">
        {/* Agent Details */}
        <div className="bg-[#fff7f4] mt-7 p-4 rounded shadow">
          {/* Profile Info Card */}
          <div className="bg-[#fff] p-6 rounded-lg max-w-full">
            {/* Profile Image Placeholder */}
            <div className="flex flex-col ">
              <div className="flex justify-center items-center w-20 h-20 rounded-full border-2 border-red-500 mb-4">
                <img src={"/ProfileImage.png"} alt="ProfileImage" />
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex gap-4">
                <p className="font-semibold w-40">Full Name:</p>
                <p>{manager.name}</p>
              </div>
              {/* <div className="flex gap-4">
                <p className="font-semibold w-40">Phone Number:</p>
                <p>+91-9876543210</p>
              </div> */}
              <div className="flex gap-4">
                <p className="font-semibold w-40">Email ID:</p>
                <p>{manager.email}</p>
              </div>
              <div className="flex gap-4">
                <p className="font-semibold w-40">Mobile:</p>
                <p>{manager.contact}</p>
              </div>
              <div className="flex gap-4 items-center">
                <p className="font-semibold w-40">Password:</p>
                <p>•••••••</p>
                {/* 🔑 Change Password Button */}
                <button
                  onClick={() => setShowPasswordPopup(true)}
                  className="ml-auto border border-red-500 text-red-500 px-3 py-1 rounded hover:bg-red-100"
                >
                  Change Password
                </button>
              </div>
            </div>

            {/* Update Profile Button */}
            {/* <div className="mt-6">
              <button className="bg-yellow-300 text-white px-6 py-2 rounded hover:bg-yellow-600">
                Update Profile
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* ✅ Password Popup */}
      <PasswordPopup
        show={showPasswordPopup}
        onClose={() => setShowPasswordPopup(false)}
        // onSubmit={handlePasswordSubmit}
      />
    </>
  );
}

export default ProfilePage;
