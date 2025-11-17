import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

function PaymentDetails() {
  const navigate = useNavigate();
  const { customerId, schemeType } = useParams();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // fixed page size, can make dropdown
  const [total, setTotal] = useState(0);
const token = sessionStorage.getItem("token");
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/transactionSchemes/transactions`,
          {
            params: { customerId, schemeType, page, limit },

             
           headers: {
            Authorization: `Bearer ${token}`,
          },
        }
          
        );

        setTransactions(res.data.transactions || []);
        setTotal(res.data.total || 0); // backend should return total count
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (customerId && schemeType) {
      fetchTransaction();
    }
  }, [customerId, schemeType, page, limit]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-red-600 rounded-md p-4 flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-black p-1 border-2 rounded-4xl"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-lg font-bold">Payment Details</h2>
      </div>

      {/* Table Section */}
      <div className="flex flex-col bg-[#fff9f1] p-6 mt-6 rounded w-[95%] mx-auto">
        {loading ? (
          <p className="text-gray-600">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-600">No transactions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full border border-gray-300 bg-white">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-2 border">Txn ID</th>
                    <th className="p-2 border">Account No</th>
                    <th className="p-2 border">Type</th>
                    <th className="p-2 border">Amount</th>
                    <th className="p-2 border">Mode</th>
                    <th className="p-2 border">Installment</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Agent</th>
                    <th className="p-2 border">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="text-center hover:bg-gray-50">
                      <td className="p-2 border">{txn.transactionId}</td>
                      <td className="p-2 border">{txn.accountNumber}</td>
                      <td className="p-2 border">{txn.transactionType}</td>
                      <td className="p-2 border font-semibold">
                        ₹{txn.amount.toLocaleString()}
                      </td>
                      <td className="p-2 border">{txn.mode}</td>
                      <td className="p-2 border">{txn.installmentNo || "-"}</td>
                      <td
                        className={`p-2 border font-semibold ${
                          txn.status === "approved"
                            ? "text-green-600"
                            : txn.status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {txn.status}
                      </td>
                      <td className="p-2 border">{txn.agentId?.name || "-"}</td>
                      <td className="p-2 border">
                        {new Date(txn.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`px-3 py-1 border rounded ${
                  page === 1 ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Prev
              </button>
              <span>
                Page {page} of {totalPages || 1}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`px-3 py-1 border rounded ${
                  page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default PaymentDetails;
