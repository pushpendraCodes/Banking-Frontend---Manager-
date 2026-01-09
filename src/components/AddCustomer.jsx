import { FaArrowLeft, FaCamera, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
// import { apiCustomerUrl, apiAgentUrl } from "../../api/apiRoutes";
import { useForm, Controller } from "react-hook-form";

const AddCustomer = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [agents, setAgents] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const token = sessionStorage.getItem("token")
  const managerId = JSON.parse(sessionStorage.getItem("user"))._id
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/agent?managerId=${managerId}&all=true`, {
          headers: {
            Authorization: `Bearer ${token}`

          },
        });
        setAgents(res.data.data || []);
      } catch (err) {
        console.error("Error fetching agents:", err);
      }
    };
    fetchAgents();
  }, []);

  const profilePicture = watch("profilePicture");
  const [profilePreview, setProfilePreview] = useState(null);
  // Handle profile picture preview
  useEffect(() => {
    if (profilePicture && profilePicture[0]) {
      const file = profilePicture[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setProfilePreview(null);
    }
  }, [profilePicture]);

  const removeProfilePicture = () => {
    setProfilePreview(null);
    // Reset the file input
    const fileInput = document.getElementById('profilePictureInput');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "signature" && data.signature[0]) {
          formData.append("signature", data.signature[0]);
        } else if (key === "profilePicture" && data.profilePicture[0]) {
          formData.append("picture", data.profilePicture[0]);
        } else if (key === "NomineeDetails") {
          Object.keys(data.NomineeDetails).forEach((nkey) => {
            formData.append(`NomineeDetails[${nkey}]`, data.NomineeDetails[nkey]);
          });
        } else {
          formData.append(key, data[key]);
        }
      });
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/customer`, formData, {
        headers: {
          Authorization: `Bearer ${token}`

        },
      });

      if (res.status === 201 || res.status === 200) {
        alert("Customer added successfully!");
        navigate(-1);
      }
    } catch (err) {
      console.error("Error adding customer:", err.response?.data || err.message);
      alert("Failed to add customer");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-r from-yellow-50 to-white p-5">
      <div className="w-full mx-auto shadow-lg rounded-xl bg-white">
        {/* Header */}
        <div className="flex  justify-between border-b px-6 py-2 rounded-t-xl bg-gradient-to-br from-orange-500 via-red-500 to-red-600">
          <div className="flex  gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-yellow-500 p-2 rounded-full border transition-colors"
              title="Back"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-semibold tracking-wide text-gray-900">
              Add Customer
            </h2>
          </div>
          <button
            form="customerForm"
            type="submit"
            disabled={isSubmitting}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg shadow-sm active:scale-95 transition-all"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
        <form
          id="customerForm"
          onSubmit={handleSubmit(onSubmit)}
        >

          <div className="mb-8 flex flex-col items-center">
            <h3 className="font-semibold mb-4 text-gray-700 text-center">
              Profile Picture
            </h3>

            <div className="relative">
              {profilePreview ? (
                <div className="relative">
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-yellow-200 shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeProfilePicture}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                    title="Remove Picture"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-yellow-200 flex items-center justify-center shadow-lg">
                  <FaCamera className="text-gray-400 text-2xl" />
                </div>
              )}
            </div>

            <div className="mt-4 w-full max-w-sm">
              <input
                id="profilePictureInput"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                {...register("profilePicture", {
                  validate: {
                    fileType: (files) => {
                      if (!files || !files[0]) return true; // Optional field
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                      return allowedTypes.includes(files[0].type) || "Only JPG and PNG files are allowed";
                    },
                    fileSize: (files) => {
                      if (!files || !files[0]) return true; // Optional field
                      return files[0].size <= 5 * 1024 * 1024 || "File size must be less than 5MB";
                    }
                  }
                })}
                className={`w-full p-3 border ${errors.profilePicture
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              />
              {errors.profilePicture && (
                <p className="text-red-500 text-xs mt-1">{errors.profilePicture.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Optional: Upload JPG or PNG (max 5MB)
              </p>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {/* NAME */}




            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                  maxLength: { value: 50, message: "Name cannot exceed 50 characters" },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: "Name can only contain letters and spaces"
                  }
                })}
                placeholder="Enter Name"
                className={`w-full p-3 border ${errors.name
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: "Please enter a valid email address",
                  },
                })}
                placeholder="Enter Email"
                className={`w-full p-3 border ${errors.email
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* CONTACT */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Contact <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                {...register("contact", {
                  required: "Contact number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Contact must be a valid 10-digit Indian mobile number",
                  },
                })}
                placeholder="Enter Contact Number"
                className={`w-full p-3 border ${errors.contact
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              />
              {errors.contact && (
                <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>
              )}
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("address", {
                  required: "Address is required",
                  minLength: { value: 10, message: "Address must be at least 10 characters" },
                  maxLength: { value: 200, message: "Address cannot exceed 200 characters" }
                })}
                placeholder="Enter Full Address"
                className={`w-full p-3 border ${errors.address
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
              )}
            </div>

            {/* GENDER */}
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
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    }

                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      className={`w-full p-3 border ${errors.password
                        ? "border-red-400"
                        : "border-gray-200 focus:border-yellow-400"
                        } rounded-lg bg-gray-50 pr-10 outline-none duration-200`}
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* AGENT */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Agent <span className="text-red-500">*</span>
              </label>
              <select
                {...register("agentId", { required: "Agent selection is required" })}
                className={`w-full p-3 border ${errors.agentId
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              >
                <option value="">Select Agent</option>
                {agents.map((agent) => (
                  <option key={agent._id} value={agent._id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              {errors.agentId && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.agentId.message}
                </p>
              )}
            </div>

            {/* AADHAR */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Aadhar Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={12}
                {...register("AadharNo", {
                  required: "Aadhar number is required",
                  minLength: { value: 12, message: "Aadhar number must be exactly 12 digits" },
                  maxLength: { value: 12, message: "Aadhar number must be exactly 12 digits" },
                  pattern: {
                    value: /^[2-9]\d{11}$/,
                    message: "Aadhar number must be 12 digits and cannot start with 0 or 1",
                  }
                })}
                placeholder="Enter 12-digit Aadhar Number"
                className={`w-full p-3 border ${errors.AadharNo
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              />
              {errors.AadharNo && (
                <p className="text-red-500 text-xs mt-1">{errors.AadharNo.message}</p>
              )}
            </div>

            {/* PANCARD */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                PAN Card <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                {...register("panCard", {
                  required: "PAN Card number is required",
                  pattern: {
                    value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    message: "PAN Card format: ABCDE1234F (5 letters, 4 digits, 1 letter)"
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase();
                  }
                })}
                placeholder="Enter PAN Card Number"
                className={`w-full p-3 border ${errors.panCard
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.panCard && (
                <p className="text-red-500 text-xs mt-1">{errors.panCard.message}</p>
              )}
            </div>
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Saving AC Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                {...register("savingAccountNumber", {
                  required: "Account number is required",
                
                  // onChange: (e) => {
                  //   e.target.value = e.target.value.toUpperCase();
                  // }
                })}
                placeholder="Enter Saving Account Number "
                className={`w-full p-3 border ${errors.savingAccountNumber
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
             
              />
              {errors.savingAccountNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.savingAccountNumber.message}</p>
              )}
            </div>

            {/* SIGNATURE UPLOAD */}
            <div>
              <label className="block font-semibold text-sm mb-1 text-gray-700">
                Signature (Upload) <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                {...register("signature", {
                  required: "Signature upload is required",
                  validate: {
                    fileType: (files) => {
                      if (!files[0]) return "Signature is required";
                      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                      return allowedTypes.includes(files[0].type) || "Only JPG, PNG, or PDF files are allowed";
                    },
                    fileSize: (files) => {
                      if (!files[0]) return "Signature is required";
                      return files[0].size <= 2 * 1024 * 1024 || "File size must be less than 2MB";
                    }
                  }
                })}
                className={`w-full p-3 border ${errors.signature
                  ? "border-red-400"
                  : "border-gray-200 focus:border-yellow-400"
                  } rounded-lg bg-gray-50 outline-none duration-200`}
              />
              {errors.signature && (
                <p className="text-red-500 text-xs mt-1">{errors.signature.message}</p>
              )}
            </div>
          </div>

          {/* NOMINEE DETAILS */}
          <div className="border-t border-gray-200 mt-6 p-8">
            <h3 className="font-semibold mb-4 text-gray-700">
              Nominee Details <span className="text-red-500">*</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Nominee Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("NomineeDetails.name", {
                    required: "Nominee name is required",
                    minLength: { value: 2, message: "Nominee name must be at least 2 characters" },
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: "Nominee name can only contain letters and spaces"
                    }
                  })}
                  placeholder="Enter Nominee Name"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.name
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                />
                {errors?.NomineeDetails?.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.name.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Relation <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("NomineeDetails.relation", { required: "Relation is required" })}
                  className={`w-full p-3 border ${errors?.NomineeDetails?.relation
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                >
                  <option value="">Select Relation</option>
                  <option value="spouse">Spouse</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="brother">Brother</option>
                  <option value="sister">Sister</option>
                  <option value="other">Other</option>
                </select>
                {errors?.NomineeDetails?.relation && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.relation.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  {...register("NomineeDetails.age", {
                    required: "Nominee age is required",
                    min: { value: 1, message: "Age must be at least 1" },
                    max: { value: 120, message: "Age cannot exceed 120" },
                    valueAsNumber: true
                  })}
                  placeholder="Enter Age"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.age
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                />
                {errors?.NomineeDetails?.age && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.age.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  {...register("NomineeDetails.dob", {
                    required: "Date of birth is required",
                    validate: {
                      notFuture: (value) => {
                        return new Date(value) <= new Date() || "Date of birth cannot be in the future";
                      }
                    }
                  })}
                  className={`w-full p-3 border ${errors?.NomineeDetails?.dob
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                />
                {errors?.NomineeDetails?.dob && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.dob.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Nominee Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register("NomineeDetails.email", {
                    required: "Nominee email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address"
                    }
                  })}
                  placeholder="Enter Nominee Email"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.email
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                />
                {errors?.NomineeDetails?.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.email.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  {...register("NomineeDetails.mobile", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Mobile must be a valid 10-digit Indian number"
                    }
                  })}
                  placeholder="Enter Mobile Number"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.mobile
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                />
                {errors?.NomineeDetails?.mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.mobile.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Nominee Aadhar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  {...register("NomineeDetails.AadharNo", {
                    required: "Nominee's Aadhar number is required",
                    minLength: { value: 12, message: "Aadhar number must be exactly 12 digits" },
                    maxLength: { value: 12, message: "Aadhar number must be exactly 12 digits" },
                    pattern: {
                      value: /^[2-9]\d{11}$/,
                      message: "Aadhar number must be 12 digits and cannot start with 0 or 1"
                    },
                  })}
                  placeholder="Enter Nominee Aadhar Number"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.AadharNo
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                />
                {errors?.NomineeDetails?.AadharNo && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.AadharNo.message}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Nominee PAN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  {...register("NomineeDetails.panCard", {
                    // required: "Nominee PAN Card is required",
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: "PAN Card format: ABCDE1234F (5 letters, 4 digits, 1 letter)"
                    },
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    }
                  })}
                  placeholder="Enter Nominee PAN Number"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.panCard
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200`}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors?.NomineeDetails?.panCard && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.panCard.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-sm mb-1 text-gray-700">
                  Nominee Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  {...register("NomineeDetails.address", {
                    required: "Nominee address is required",
                    minLength: { value: 10, message: "Address must be at least 10 characters" },
                    maxLength: { value: 200, message: "Address cannot exceed 200 characters" }
                  })}
                  placeholder="Enter Nominee's Complete Address"
                  className={`w-full p-3 border ${errors?.NomineeDetails?.address
                    ? "border-red-400"
                    : "border-gray-200 focus:border-yellow-400"
                    } rounded-lg bg-gray-50 outline-none duration-200 resize-none`}
                />
                {errors?.NomineeDetails?.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.NomineeDetails.address.message}</p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;
