import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import { useForm } from "react-hook-form";

const EditAgent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [managers, setManagers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [newSignatureFile, setNewSignatureFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  const token = sessionStorage.getItem("token");
  const managerId = JSON.parse(sessionStorage.getItem("user"))._id
  const [agent, setAgent] = useState({})
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/agent/${id}`,{
                headers: {
                    Authorization: `Bearer ${token}`

                },
            })
      .then((res) => {
        const customer = res.data.data || res.data;
        setAgent(customer)
        reset({
          name: customer.name || "",
          email: customer.email || "",
          contact: customer.contact || "",
          address: customer.address || "",
          areaManagerId: customer.areaManagerId?._id || "",
          gender: customer.gender || "",
          AadharNo: customer.AadharNo || "",
          panCard: customer.panCard || "",
          signature: customer.signature,
          NomineeDetails: {
            name: customer.NomineeDetails?.name || "",
            relation: customer.NomineeDetails?.relation || "",
            age: customer.NomineeDetails?.age || "",
            dob: customer.NomineeDetails?.dob
              ? customer.NomineeDetails.dob.slice(0, 10)
              : "",
            email: customer.NomineeDetails?.email || "",
            mobile: customer.NomineeDetails?.mobile || "",
            AadharNo: customer.NomineeDetails?.AadharNo || "",
            panCard: customer.NomineeDetails?.panCard || "",
            address: customer.NomineeDetails?.address || ""
          }

        });
        setPreviewSignature(customer.signature || null);
      })
      .catch((err) => {
        console.error("Error fetching agent:", err);
        alert("Failed to load agent data ❌");
      })
      .finally(() => setLoading(false));
  }, [id, reset, token]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/areaManager?managerId=${managerId}`,{
                headers: {
                    Authorization: `Bearer ${token}`

                },
            })
      .then((res) => setManagers(res.data.data || res.data))
      .catch((err) => console.error("Error fetching managers:", err));
  }, [token]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "NomineeDetails") {
        Object.entries(value).forEach(([nkey, nvalue]) => {
          formData.append(`NomineeDetails[${nkey}]`, nvalue);
        });
      } else {
        formData.append(key, value);
      }
    });

    if (newSignatureFile) {
      formData.append("signature", newSignatureFile);
    }
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/agent/${id}`, formData,{
                headers: {
                    Authorization: `Bearer ${token}`

                },
            });
      alert("Agent updated successfully ✅");
      navigate(-1);
    } catch (error) {
      console.error("Update Error:", error.response?.data || error.message);
      alert("Failed to update agent ❌");
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-r p-4">
      <div className="w-full mx-auto shadow-lg rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 rounded-t-xl bg-gradient-to-br from-orange-500 via-red-500 to-red-600">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-black hover:text-yellow-500 p-2 rounded-full border transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-semibold">View/Edit Agent</h2>
          </div>
          <button
            type="submit"
            form="editAgentForm"
            className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-6 py-2 rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>

        <form
          id="editAgentForm"
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full"
        >
          {/* Left column */}
          <div>
            <label className="block font-semibold text-sm mb-1 text-gray-700">Agent Name</label>
            <input {...register("name", { required: "Name required" })} placeholder="Agent Name"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}

            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">Agent Email</label>
            <input {...register("email", { required: "Email required" })} placeholder="Email"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}

            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">Contact</label>
            <input {...register("contact", { required: "Contact required", pattern: { value: /^\d{10}$/, message: "10 digits" } })}
              placeholder="Contact" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none" />
            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>}

            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">Gender</label>
            <select {...register("gender", { required: "Gender required" })} className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}

            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">Address</label>
            <input {...register("address", { required: "Address required" })}
              placeholder="Address"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none" />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}

            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">Area Manager</label>
            <select {...register("areaManagerId", { required: "Manager required" })}
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none">
              <option value="">Select  Manager</option>
              {managers.map((manager) => (
                <option key={manager._id} value={manager._id}>{manager.name}</option>
              ))}
            </select>
            {errors.areaManagerId && <p className="text-red-500 text-xs mt-1">{errors.areaManagerId.message}</p>}



          </div>
          {/* Right column */}
          <div>
            <label className="block font-semibold text-sm mb-1 text-gray-700">Aadhaar No</label>
            <input {...register("AadharNo", { required: "Aadhar required", pattern: { value: /^\d{12}$/, message: "Must be 12 digits" } })}
              placeholder="Aadhaar No" className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none" />
            {errors.AadharNo && <p className="text-red-500 text-xs mt-1">{errors.AadharNo.message}</p>}

            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">PAN Card</label>
            <input {...register("panCard", {
              required: "PAN required",
              pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: "Invalid PAN" },
                         onChange: (e) => {
        e.target.value = e.target.value.toUpperCase();
      }
            })} placeholder="PAN Card"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none uppercase" />
            {errors.panCard && <p className="text-red-500 text-xs mt-1">{errors.panCard.message}</p>}

            {/* Signature */}
            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">Signature (Re-upload to change)</label>
            <input type="file" accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setNewSignatureFile(file);
                  setPreviewSignature(URL.createObjectURL(file));
                }
              }}
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            />
            <div className="mt-2">
              {previewSignature ? (
                previewSignature.endsWith(".pdf") ? (
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
                )
              ) : (
                // show existing signature from DB if no new file selected
                agent?.signature && (
                  agent.signature.endsWith(".pdf") ? (
                    <embed
                      src={agent.signature}
                      type="application/pdf"
                      className="h-32 border rounded"
                    />
                  ) : (
                    <img
                      src={agent.signature}
                      alt="Signature"
                      className="h-24 border rounded"
                    />
                  )
                )
              )}
            </div>

            <div className="mt-6">
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                  placeholder="Enter new password"
                  className={`w-full p-3 border ${errors.password ? "border-red-400" : "border-gray-200"} rounded-lg bg-gray-50 outline-none pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}

            </div>
          </div>
          {/* Full width nominee details */}
          <div className="md:col-span-2 border-t border-gray-200 mt-6 pt-4">
            <h3 className="font-semibold mb-4 text-gray-700">Nominee Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Nominee Name
                </label>
                <input
                  type="text"
                  {...register("NomineeDetails.name", {
                    required: "Nominee name required"
                  })}
                  placeholder="Nominee Name"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.name
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none`}
                />
                {errors?.NomineeDetails?.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.name.message}
                  </p>
                )}
              </div>

             <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Relation <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("NomineeDetails.relation", { required: "Relation is required" })}
                  className={`w-full p-3 border ${
                    errors?.NomineeDetails?.relation ? "border-red-400" : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
                >
                  <option value="">Select Relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother">Brother</option>
                  <option value="Sister">Sister</option>
                  <option value="Other">Other</option>
                </select>
                {errors?.NomineeDetails?.relation && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.relation.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  {...register("NomineeDetails.age", {
                    required: "Age required"
                  })}
                  placeholder="Age"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.age
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none`}
                />
                {errors?.NomineeDetails?.age && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.age.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  {...register("NomineeDetails.dob", {
                    required: "DOB required"
                  })}
                  className={`w-full p-3 border ${errors?.NomineeDetails?.dob
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none`}
                />
                {errors?.NomineeDetails?.dob && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.dob.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Nominee Email
                </label>
                <input
                  type="email"
                  {...register("NomineeDetails.email", {
                    required: "Email required"
                  })}
                  placeholder="Nominee Email"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.email
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none`}
                />
                {errors?.NomineeDetails?.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Mobile Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  {...register("NomineeDetails.mobile", {
                    required: "Mobile number required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "10-digit mobile required"
                    }
                  })}
                  placeholder="Mobile"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.mobile
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none`}
                />
                {errors?.NomineeDetails?.mobile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.mobile.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  maxLength={12}
                  {...register("NomineeDetails.AadharNo", {
                    required: "Aadhaar required",
                    pattern: {
                      value: /^\d{12}$/,
                      message: "Must be 12 digits"
                    }
                  })}
                  placeholder="Nominee Aadhaar"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.AadharNo
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none`}
                />
                {errors?.NomineeDetails?.AadharNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.AadharNo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  PAN Card
                </label>
                <input
                  type="text"
                  maxLength={10}
                  {...register("NomineeDetails.panCard", {
                    // required: "PAN required",
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: "Invalid PAN format"
                    },
                               onChange: (e) => {
        e.target.value = e.target.value.toUpperCase();
      }
                  })}
                  placeholder="Nominee PAN"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.panCard
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none uppercase`}
                />
                {errors?.NomineeDetails?.panCard && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.panCard.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  {...register("NomineeDetails.address", {
                    required: "Address required"
                  })}
                  placeholder="Nominee Address"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.address
                    ? "border-red-400"
                    : "border-gray-200"
                    } rounded-lg bg-gray-50 outline-none`}
                />
                {errors?.NomineeDetails?.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.NomineeDetails.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAgent;
