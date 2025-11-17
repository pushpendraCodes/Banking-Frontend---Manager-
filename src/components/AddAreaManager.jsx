import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
// import { apiManagerUrl } from "../../api/apiRoutes";
import { useForm } from "react-hook-form";

const AddAreaManager = () => {
    const navigate = useNavigate();
    const [previewSignature, setPreviewSignature] = useState(null);
    const [newSignatureFile, setNewSignatureFile] = useState(null);
    //   const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const token = sessionStorage.getItem("token");
    const managerId = JSON.parse(sessionStorage.getItem("user"))._id
    //   const fetchManagers = async () => {
    //     try {
    //       setLoading(true);
    //       const response = await axios.get(`${apiManagerUrl}?all=true`, {
    //         headers: { Authorization: `Bearer ${token}` },
    //       });
    //       setManagers(response.data.data);
    //     } catch (err) {
    //       console.error("API Error:", err);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    //   useEffect(() => {
    //     fetchManagers();
    //   }, []);

    const onSubmit = async (data) => {
        const formData = new FormData();

        // Append all fields
        for (let key in data) {
            if (key === "signature" && data.signature[0]) {
                formData.append("signature", data.signature[0]);
            } else {
                formData.append(key, data[key]);
            }
        }
        formData.append("managerId", managerId)
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/areaManager/register`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert("Area Manager added successfully ✅");
            navigate(-1);
        } catch (error) {
            console.error("Error adding manager:", error);
            alert(error.response.data.error||"Error while adding manager ❌");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-white px-4 flex justify-center ">
            <div className="w-full shadow-lg rounded-xl bg-white">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-3 rounded-t-xl bg-gradient-to-br from-orange-500 via-red-500 to-red-600">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-600 hover:text-yellow-500 p-2 rounded-full border transition-colors"
                            title="Back"
                        >
                            <FaArrowLeft />
                        </button>
                        <h2 className="text-xl font-semibold tracking-wide text-gray-900">
                            Add Area Manager
                        </h2>
                    </div>
                    <button
                        type="submit"
                        form="addAgentForm"
                        className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg shadow-sm active:scale-95 transition-all"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Saving..." : "Save"}
                    </button>
                </div>

                <form id="addAgentForm" onSubmit={handleSubmit(onSubmit)}>
                    <div className="p-8 grid md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("name", { required: "Name is required" })}
                                placeholder="Enter Manager Name"
                                className={`w-full p-3 border ${errors.name
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                {...register("email", { required: "Email is required" })}
                                placeholder="Enter Email Address"
                                className={`w-full p-3 border ${errors.email
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200`}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                Contact Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={10}
                                {...register("contact", {
                                    required: "Contact number is required",
                                    pattern: {
                                        value: /^[6-9]\d{9}$/,
                                        message: "Enter valid 10-digit number",
                                    },
                                })}
                                placeholder="Enter Contact Number"
                                className={`w-full p-3 border ${errors.contact
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200`}
                            />
                            {errors.contact && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.contact.message}
                                </p>
                            )}
                        </div>

                        {/* Aadhaar */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                Aadhaar Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={12}
                                {...register("AadharNo", {
                                    required: "Aadhaar number is required",
                                    pattern: {
                                        value: /^[2-9]\d{11}$/,
                                        message: "Must be 12 digits & not start with 0/1",
                                    },
                                })}
                                placeholder="Enter Aadhaar Number"
                                className={`w-full p-3 border ${errors.AadharNo
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200`}
                            />
                            {errors.AadharNo && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.AadharNo.message}
                                </p>
                            )}
                        </div>

                        {/* PAN */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                PAN Card <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                maxLength={10}
                                {...register("panCard", {
                                    required: "PAN Card is required",
                                    pattern: {
                                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                                        message: "Format: ABCDE1234F",
                                    },
                                               onChange: (e) => {
        e.target.value = e.target.value.toUpperCase();
      }
                                })}
                                placeholder="Enter PAN Card Number"
                                className={`w-full p-3 border ${errors.panCard
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200 uppercase`}
                            />
                            {errors.panCard && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.panCard.message}
                                </p>
                            )}
                        </div>

                        {/* Signature */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                Signature <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                {...register("signature", {
                                    required: "Signature upload is required",
                                })}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setNewSignatureFile(file);
                                        setPreviewSignature(URL.createObjectURL(file));
                                    }
                                }}
                                className={`w-full p-3 border ${errors.signature
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200`}
                            />
                            {previewSignature && (
                                <div className="mt-2">
                                    {previewSignature.endsWith(".pdf") ? (
                                        <embed
                                            src={previewSignature}
                                            type="application/pdf"
                                            className="h-32 border rounded"
                                        />
                                    ) : (
                                        <img
                                            src={previewSignature}
                                            alt="Signature Preview"
                                            className="h-24 border rounded"
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                Address <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("address", { required: "Address is required" })}
                                placeholder="Enter Complete Address"
                                className={`w-full p-3 border ${errors.address
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200`}
                            />
                            {errors.address && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.address.message}
                                </p>
                            )}
                        </div>

                        {/* Manager Dropdown */}
                        {/* <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Select Branch Manager <span className="text-red-500">*</span>
              </label>
              <select
                {...register("managerId", {
                  required: "Manager selection is required",
                })}
                className={`w-full p-3 border ${
                  errors.managerId
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                } rounded-lg bg-gray-50 outline-none duration-200`}
              >
                <option value="">Select Manager</option>
                {loading ? (
                  <option>Loading...</option>
                ) : (
                  managers?.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))
                )}
              </select>
              {errors.managerId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.managerId.message}
                </p>
              )}
            </div> */}

                        {/* Gender */}
                        <div>
                            <label className="block font-semibold text-sm mb-1 text-gray-700">
                                Gender <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register("gender", { required: "Gender selection is required" })}
                                className={`w-full p-3 border ${errors.gender
                                    ? "border-red-400"
                                    : "border-gray-200 focus:border-yellow-400"
                                    } rounded-lg bg-gray-50 outline-none duration-200`}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.gender && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.gender.message}
                                </p>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAreaManager;
