import React, { useState } from "react";
import { X, DollarSign, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import moment from "moment";

const LakhpatiMaturityModal = ({ customer, lakhpatiYojanaAccountNumber }) => {
  const token = sessionStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    savingAccountNumber: customer?.savingAccountNumber,
    lakhpatiYojanaAccountNumber,
  });
  const [maturityData, setMaturityData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Calculate payout for Lakhpati Yojana
  const calculateLakhpatiPayout = (scheme) => {
    if (!scheme) return null;

    const openingDate = new Date(scheme.lakhpatiYojanaOpeningDate);
    const tenureMonths = Number(scheme.lakhpatiYojanaTenure);
    const now = new Date();
    const elapsedMonths = moment(now).diff(moment(openingDate), "months");

    const principal = Number(scheme.lakhpatiYojanaDepositAmount) || 0;
    const rate = Number(scheme.lakhpatiYojanaInterestRate) / 100;

    let prematureRate = null;
    let isPremature = false;
    let canWithdraw = true;

    // Example rules (customize as per your scheme’s policy)
    if (elapsedMonths < tenureMonths) {
      isPremature = true;
      prematureRate = 4.5 / 100; // use reduced rate if premature
    }

    let interestEarned = 0;
    let netPayable = 0;

    if (!canWithdraw) {
      netPayable = 0;
    } else if (isPremature && prematureRate) {
      const yearsElapsed = elapsedMonths / 12;
      interestEarned = principal * prematureRate * yearsElapsed;
      netPayable = principal + interestEarned;
    } else {
      // Full maturity
      const years = tenureMonths / 12;
      interestEarned = principal * rate * years;
      netPayable = principal + interestEarned;
    }

    return {
      principalDeposited: principal,
      interestEarned,
      netPayable,
      penalty: isPremature ? (principal * rate * (tenureMonths / 12)) - netPayable : 0,
      elapsedMonths,
      tenureMonths,
      isPremature,
      canWithdraw,
      prematureRate: prematureRate ? prematureRate * 100 : null,
    };
  };

  const handleCalculate = () => {
    setLoading(true);

    const scheme = customer.lakhpatiSchemes.find(
      (s) => s.lakhpatiYojanaAccountNumber == formData.lakhpatiYojanaAccountNumber
    );

    if (!scheme) {
      alert("Lakhpati Yojana scheme not found for this customer");
      setLoading(false);
      return;
    }
    const now = new Date();

    setMaturityData({
      principalDeposited: scheme.lakhpatiYojanaTotalDepositedAmount,
      netPayable: scheme.lakhpatiYojanaMaturityAmount,
      penalty: 0,
      maturityDate:scheme.lakhpatiYojanaMaturityDate,
      canWithdraw: new Date(scheme.lakhpatiYojanaMaturityDate) <= now,
      tenureMonths: scheme.lakhpatiYojanaTenureType === "year"
        ? scheme.lakhpatiYojanaTenure * 12
        : scheme.lakhpatiYojanaTenure,
    });

    setLoading(false);
  };
console.log(maturityData,"maturityData")
  const handleProceedToConfirmation = () => {
    if (!maturityData || !maturityData.canWithdraw) return;
    setShowConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    if (!formData.savingAccountNumber || !formData.lakhpatiYojanaAccountNumber) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/transactionSchemes/transaction/Lakhpati/maturityPay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: customer._id,
            lakhpatiYojanaAccountNumber: formData.lakhpatiYojanaAccountNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error processing Lakhpati payout");
      } else {
        alert(data.message || "Lakhpati payout processed successfully!");
        handleClose();
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("Server error occurred while processing payout");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowConfirmation(false);
    setMaturityData(null);
  };

  return (
    <div>
      {/* Trigger Button */}
      <div className="mt-6 flex justify-left text-left">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-500 mt-3 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
        >
          Lakhpati Maturity
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button onClick={handleClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Lakhpati Maturity / Premature Closure</h2>
                  <p className="text-purple-100 text-sm">Process Lakhpati Yojana closure</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!showConfirmation ? (
                <>
                  {/* Input Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Saving Account</label>
                      <input
                        type="text"
                        disabled
                        value={formData.savingAccountNumber}
                        className="w-full px-4 py-3 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lakhpati Account</label>
                      <input
                        type="text"
                        disabled
                        value={formData.lakhpatiYojanaAccountNumber}
                        className="w-full px-4 py-3 border rounded-xl"
                      />
                    </div>
                    <button
                      onClick={handleCalculate}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold"
                    >
                      {loading ? "Calculating..." : "Calculate Maturity Amount"}
                    </button>
                  </div>

                  {/* Maturity Details */}
                  {maturityData && (
                    <div className="mt-6 space-y-4">
                      {maturityData.isPremature && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <p className="text-sm text-yellow-700">
                            Premature closure detected. Reduced interest rate applied.
                          </p>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                        <div className="flex justify-between"><span>Principal Amount</span><span>₹{maturityData?.principalDeposited.toLocaleString()}</span></div>
                        {/* <div className="flex justify-between"><span>Interest Earned</span><span>₹{maturityData.interestEarned.toLocaleString()}</span></div> */}
                        {maturityData.penalty > 0 && (
                          <div className="flex justify-between text-red-600">
                            <span>Penalty</span><span>-₹{maturityData.penalty.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg mt-2">
                          <span>Maturity Amount</span><span>₹{maturityData.netPayable.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg mt-2">
                          <span>Maturity Date</span><span>{new Date(maturityData.maturityDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-600 text-lg mt-2">
                          <span>Net Payable</span><span>₹{maturityData.netPayable.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleProceedToConfirmation}
                        disabled={!maturityData.canWithdraw}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold mt-4 transition-colors 
    ${maturityData.canWithdraw
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Proceed to Confirmation</span>
                      </button>

                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-6 text-center">
                  <h3 className="text-2xl font-bold">Confirm Lakhpati Closure</h3>
                  <p className="text-gray-600">Are you sure you want to process this closure?</p>
                  <div className="bg-gray-50 rounded-xl p-6 border mt-4">
                    <div className="flex justify-between"><span>Saving Ac:</span><span>{formData.savingAccountNumber}</span></div>
                    <div className="flex justify-between"><span>Lakhpati Account:</span><span>{formData.lakhpatiYojanaAccountNumber}</span></div>
                    <div className="flex justify-between font-bold text-green-600 mt-3"><span>Amount to be Paid:</span><span>₹{maturityData.netPayable.toLocaleString()}</span></div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button onClick={() => setShowConfirmation(false)} className="flex-1 bg-gray-200 py-3 rounded-xl">Go Back</button>
                    <button onClick={handleFinalSubmit} className="flex-1 bg-purple-600 text-white py-3 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" /> Confirm & Process
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LakhpatiMaturityModal;
