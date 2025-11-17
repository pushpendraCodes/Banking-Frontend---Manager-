import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CreateLakhpatiSchem() {
  const { customerId, savingAc } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tenure: "3",
    tenureType: "year",
    InstallAmount: "",
    maturityAmount: 100000,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.tenure) {
      newErrors.tenure = "Tenure is required";
    } else if (formData.tenure <= 0) {
      newErrors.tenure = "Tenure must be greater than 0";
    }

    if (!formData.InstallAmount) {
      newErrors.InstallAmount = "Installment Amount is required";
    } else if (Number(formData.InstallAmount) < 500) {
      newErrors.InstallAmount =
        "Minimum installment amount is ₹500";
    }

    if (!formData.maturityAmount) {
      newErrors.maturityAmount = "Maturity Amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const token = sessionStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/customer/createLakhpati/${customerId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert("✅ Lakhpati Yojana created successfully!");
        setFormData({
          tenure: "",
          tenureType: "month",
          InstallAmount: "",
          maturityAmount: "",
        });
        navigate(-1);
      } else {
        alert(response.data.message || "Failed to create Lakhpati Yojana.");
      }
    } catch (error) {
      console.error("Error creating Lakhpati:", error);
      alert(
        error.response?.data?.message ||
          "Failed to create Lakhpati Yojana. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          Create Lakhpati Yojana
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tenure */}
        <div>
  <label
    htmlFor="tenure"
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Tenure *
  </label>
  <select
    id="tenure"
    name="tenure"
    value={formData.tenure}
    onChange={handleChange}
    className={`w-full px-4 py-2 border rounded-lg ${
      errors.tenure ? "border-red-500" : "border-gray-300"
    }`}
  >
    <option value="">-- Select Tenure --</option>
    <option value="2">2 Years</option>
    <option value="3">3 Years</option>
    <option value="4">4 Years</option>
    <option value="5">5 Years</option>
  </select>
  {errors.tenure && (
    <p className="mt-1 text-sm text-red-600">{errors.tenure}</p>
  )}
</div>


        {/* Tenure Type */}
        <div>
          <label
            htmlFor="tenureType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tenure Type *
          </label>
          <select
            id="tenureType"
            name="tenureType"
            value={formData.tenureType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {/* <option value="month">Months</option> */}
            <option value="year">Years</option>
            {/* <option value="week">Weeks</option> */}
          </select>
        </div>

        {/* Installment Amount */}
    <div>
  <label
    htmlFor="InstallAmount"
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Installment Amount (₹) *
  </label>
  <select
    id="InstallAmount"
    name="InstallAmount"
    value={formData.InstallAmount}
    onChange={handleChange}
    className={`w-full px-4 py-2 border rounded-lg ${
      errors.InstallAmount ? "border-red-500" : "border-gray-300"
    }`}
  >
    <option value="">-- Select Installment Amount --</option>
    <option value="3740">₹3740</option>
        <option value="2400">₹2400</option>
     <option value="1650">₹1650</option>
      <option value="1350">₹1350</option>
    {/* <option value="10000">₹10000</option> */}
  </select>
  {errors.InstallAmount && (
    <p className="mt-1 text-sm text-red-600">{errors.InstallAmount}</p>
  )}
</div>


        {/* Maturity Amount */}
        <div>
          <label
            htmlFor="maturityAmount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Maturity Amount (₹) *
          </label>
          <input
            type="number"
            id="maturityAmount"
            name="maturityAmount"
            value={formData.maturityAmount}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${
              errors.maturityAmount
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter maturity amount"
          />
          {errors.maturityAmount && (
            <p className="mt-1 text-sm text-red-600">
              {errors.maturityAmount}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Lakhpati Yojana"}
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Preview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Tenure:</span>
            <span className="ml-2">
              {formData.tenure || "-"}{" "}
              {formData.tenureType}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Saving Account:</span>
            <span className="ml-2">{savingAc || "-"}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Installment:</span>
            <span className="ml-2">
              ₹
              {formData.InstallAmount
                ? parseInt(formData.InstallAmount).toLocaleString(
                    "en-IN"
                  )
                : "-"}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Maturity:</span>
            <span className="ml-2">
              ₹
              {formData.maturityAmount
                ? parseInt(
                    formData.maturityAmount
                  ).toLocaleString("en-IN")
                : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
