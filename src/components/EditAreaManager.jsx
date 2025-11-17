import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

const EditAreaManager = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [newSignatureFile, setNewSignatureFile] = useState(null);
//   const [managers, setManagers] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const token = sessionStorage.getItem("token");

  // fetch managers for dropdown
//   const fetchManagers = async () => {
//     try {
//       const res = await axios.get(`${import.meta.env.VITE_API_URL}/manager?all=true`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setManagers(res.data.data || res.data); // adjust depending on your API response
//     } catch (err) {
//       console.error("Error fetching managers:", err);
//     }
//   };

//   useEffect(() => {
//     fetchManagers();
//   }, []);

  // fetch area manager details
  useEffect(() => {
    if (!id) return;
    setLoading(true);

    axios
      .get(`${import.meta.env.VITE_API_URL}/areaManager/${id}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      .then((res) => {
        const customer = res.data?.data || res.data;

        reset({
          name: customer.name || "",
          email: customer.email || "",
          contact: customer.contact || "",
          address: customer.address || "",
          managerId: customer.managerId|| "",
          gender: customer.gender || "",
          AadharNo: customer.AadharNo || "",
          panCard: customer.panCard || "",
        });

        setPreviewSignature(customer.signature || null);
      })
      .catch((err) => {
        console.error("Error fetching manager:", err);
        alert("Failed to fetch manager data.");
      })
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (newSignatureFile) {
      formData.append("signature", newSignatureFile);
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/areaManager/${id}`, formData,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      alert("Area Manager updated successfully ✅");
      navigate(-1);
    } catch (err) {
      console.error("Error updating manager:", err);
      alert("Failed to update manager ❌");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-600">Loading manager data...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r p-4">
      <div className="w-full mx-auto shadow-lg rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 rounded-t-xl bg-gradient-to-br from-orange-500 via-red-500 to-red-600">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-yellow-500 p-2 rounded-full border transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-semibold">Edit Area Manager</h2>
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
            {/* Name */}
            <label className="block font-semibold text-sm mb-1 text-gray-700">
              Name
            </label>
            <input
              {...register("name", { required: "Name required" })}
              placeholder="Name"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}

            {/* Email */}
            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">
              Email
            </label>
            <input
              {...register("email", { required: "Email required" })}
              placeholder="Email"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}

            {/* Contact */}
            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">
              Contact
            </label>
            <input
              {...register("contact", {
                required: "Contact required",
                pattern: { value: /^\d{10}$/, message: "10 digits" },
              })}
              placeholder="Contact"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            />
            {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact.message}</p>}

            {/* Gender */}
            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">
              Gender
            </label>
            <select
              {...register("gender", { required: "Gender required" })}
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}

            {/* Address */}
            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">
              Address
            </label>
            <input
              {...register("address", { required: "Address required" })}
              placeholder="Address"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>

          {/* Right column */}
          <div>
            {/* Aadhaar */}
            <label className="block font-semibold text-sm mb-1 text-gray-700">
              Aadhaar No
            </label>
            <input
              {...register("AadharNo", {
                required: "Aadhar required",
                pattern: { value: /^\d{12}$/, message: "Must be 12 digits" },
              })}
              placeholder="Aadhaar No"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            />
            {errors.AadharNo && <p className="text-red-500 text-xs mt-1">{errors.AadharNo.message}</p>}

            {/* PAN */}
            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">
              PAN Card
            </label>
            <input
              {...register("panCard", {
                required: "PAN required",
                pattern: {
                  value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                  message: "Invalid PAN",
                },
                           onChange: (e) => {
        e.target.value = e.target.value.toUpperCase();
      }
              })}
              placeholder="PAN Card"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none uppercase"
            />
            {errors.panCard && <p className="text-red-500 text-xs mt-1">{errors.panCard.message}</p>}

            {/* Manager Dropdown */}
            {/* <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">
              Manager
            </label>
            <select
              {...register("managerId", { required: "Manager required" })}
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 outline-none"
            >
              <option value="">Select Manager</option>
              {managers?.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
            {errors.managerId && <p className="text-red-500 text-xs mt-1">{errors.managerId.message}</p>} */}

            {/* Signature */}
            <label className="block font-semibold text-sm mb-1 text-gray-700 mt-6">
              Signature (Re-upload to change)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
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
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAreaManager;
