import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaUser, FaCreditCard, FaUserTie, FaCalendarAlt, FaRupeeSign, FaPhone, FaEnvelope, FaMapMarkerAlt, FaIdCard } from "react-icons/fa";

const PaymentDetails1 = () => {
  const [paymentData, setTransactions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const token = sessionStorage.getItem("token");

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/transactionSchemes/transaction/getByid/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        setTransactions(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch transactions");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
          <div className="flex bg-gradient-to-br from-orange-500 via-red-500 to-red-600 p-2 rounded-md items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Payment Details</h1>
              <p className="text-white mt-1">Transaction ID: {paymentData?.transactionId}</p>
            </div>
          </div>
          
          {/* Status Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <FaCreditCard className="text-2xl" />
                <div>
                  <p className="font-semibold">Transaction Status</p>
                  <p className="text-sm opacity-90">Current payment status</p>
                </div>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className={`inline-block px-4 py-2 rounded-full text-white font-medium ${getStatusColor(paymentData?.status)}`}>
                  {paymentData?.status?.toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Customer Details */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUser className="text-blue-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Customer Details</h2>
            </div>

            {/* Customer Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={paymentData?.customerId?.picture || "https://via.placeholder.com/120?text=Customer"}
                  alt="Customer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-blue-200 shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/120?text=Customer";
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaUser className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-800">{paymentData?.customerId?.name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaPhone className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{paymentData?.customerId?.contact || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaMapMarkerAlt className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-800">{paymentData?.customerId?.address || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">savingAccountNumber</p>
                  <p className="font-medium text-gray-800">{paymentData?.customerId?.savingAccountNumber || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">CustomerId</p>
                  <p className="font-medium text-gray-800">{paymentData?.customerId?.CustomerId || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">AccountBalance</p>
                  <p className="font-medium text-gray-800">₹{paymentData?.customerId?.savingAccountBalance || 0}</p>
                </div>
              </div>

              
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <FaCreditCard className="text-green-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Transaction Details</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaRupeeSign className="text-xl" />
                  <p className="text-sm opacity-90">Amount</p>
                </div>
                <p className="text-2xl font-bold">{formatAmount(paymentData?.amount)}</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaCreditCard className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Payment Mode</p>
                  <p className="font-medium text-gray-800 capitalize">{paymentData?.mode || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Transaction Date</p>
                  <p className="font-medium text-gray-800">{formatDate(paymentData?.date)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-800 break-all">{paymentData?.transactionId || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FaIdCard className="text-blue-500" />
                <div>
                  <p className="text-sm text-blue-600">Ledger Number</p>
                  <p className="font-bold text-blue-800">{paymentData?.accountNumber || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FaIdCard className="text-blue-500" />
                <div>
                  <p className="text-sm ">Account Type</p>
                  <p className="font-bold text-red-800">{paymentData?.schemeType || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <FaIdCard className="text-blue-500" />
                <div>
                  <p className="text-sm ">Transaction Type</p>
                  <p className="font-bold ">{paymentData?.transactionType || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Details */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-3 rounded-full">
                <FaUserTie className="text-purple-600 text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Agent Details</h2>
            </div>

            {/* Agent Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src="https://avatar.iran.liara.run/public/boy"
                  alt="Agent"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-purple-200 shadow-lg object-cover"
                  onError={(e) => {
                    e.target.src = "https://avatar.iran.liara.run/public/boy";
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <FaUserTie className="text-white text-xs" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaUserTie className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Agent Name</p>
                  <p className="font-medium text-gray-800">{paymentData?.agentId?.name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaPhone className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">{paymentData?.agentId?.contact || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaEnvelope className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800 break-all">{paymentData?.agentId?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaMapMarkerAlt className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-800">{paymentData?.agentId?.address || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <button
              onClick={() => window.print()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button> */}
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FaArrowLeft />
              Back to Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails1;