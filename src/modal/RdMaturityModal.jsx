import React, { useState } from "react";
import { X, DollarSign, AlertTriangle, CheckCircle, Calculator, Clock } from "lucide-react";
import moment from "moment";

const RdMaturityModal = ({ customer, rdAccountNumber }) => {
  const token = sessionStorage.getItem("token")
  console.log(customer, "customer")
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState({
    savingAccountNumber: customer?.savingAccountNumber,
    rdAccountNumber: rdAccountNumber
  });
  const [maturityData, setMaturityData] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Helper function to calculate FD maturity/premature penalty
  // ✅ Helper function to calculate RD maturity or premature payout



  // ✅ RD maturity / premature payout calculation
  const calculateRDPayout = (scheme) => {
    if (!scheme) return null;

    const monthlyInstall = Number(scheme.rdInstallAmount);
    const tenureMonths = Number(scheme.rdTenure);
    const openingDate = new Date(scheme.rdOpeningDate);
    const now = new Date();
    const elapsedMonths = moment(now).diff(moment(openingDate), "months");

    // ✅ Principal actually deposited till now
    const principal = Number(scheme.rdTotalDepositedtAmount) || (monthlyInstall * Math.min(elapsedMonths, tenureMonths));

    let prematureRate = null;
    let isPremature = false;
    let canWithdraw = true;

    // 🟢 Apply rules
    switch (tenureMonths) {
      case 12:
      case 24:
        if (elapsedMonths < tenureMonths) {
          canWithdraw = false; // ❌ Not allowed
        }
        break;

      case 36:
        if (elapsedMonths < 18) {
          canWithdraw = false;
        } else {
          isPremature = elapsedMonths < tenureMonths;
          prematureRate = 4.25 / 100;
        }
        break;

      case 48:
        if (elapsedMonths < 24) {
          canWithdraw = false;
        } else {
          isPremature = elapsedMonths < tenureMonths;
          prematureRate = 4.5 / 100;
        }
        break;

      case 60:
        if (elapsedMonths < 30) {
          canWithdraw = false;
        } else {
          isPremature = elapsedMonths < tenureMonths;
          prematureRate = 4.75 / 100;
        }
        break;

      default:
        canWithdraw = true;
    }

    let interestEarned = 0;
    let netPayable = 0;

    if (!canWithdraw) {
      netPayable = 0; // ❌ not allowed
    } else if (isPremature && prematureRate) {
      // 🟡 Premature → simple annual interest on deposited principal
      const yearsElapsed = elapsedMonths / 12;
      interestEarned = principal * prematureRate * yearsElapsed;
      netPayable = principal + interestEarned;
    } else {
      // ✅ Use total deposited amount as principal
      const principal = scheme.rdTotalDepositedtAmount || 0;
      const monthlyInstall = Number(scheme.rdInstallAmount);
      const rate = Number(scheme.rdInterestRate) / 100;
      const n = 12; // compounding yearly
      const tenureMonths = Number(scheme.rdTenure); // total tenure in months
      const paidMonths = scheme.rdTotalDepositedInstallment || 0; // installments actually paid
      const timeYears = paidMonths / 12; // actual time in years

      if (scheme.rdMaturityAmount && paidMonths === tenureMonths) {
        // 🔵 Full maturity → user paid all installments → use scheme maturity
        interestEarned = scheme.rdMaturityAmount - principal;
        netPayable = scheme.rdMaturityAmount;
      } else {
        // 🔵 Partial maturity → recalc based on deposits actually made
        const maturityAmount =
          monthlyInstall *
          ((Math.pow(1 + rate / n, n * timeYears) - 1) / (rate / n));

        interestEarned = maturityAmount - principal;
        netPayable = maturityAmount;
      }
    }


    return {
      principalDeposited: principal,
      interestEarned,
      netPayable,
      maturityAmount: scheme.rdMaturityAmount,
      penalty: scheme.rdMaturityAmount - netPayable,
      elapsedMonths,
      tenureMonths,
      isPremature,
      canWithdraw,
      prematureRate: prematureRate ? prematureRate * 100 : null,
    };
  };



  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!formData.savingAccountNumber || !formData.rdAccountNumber) return;

    setLoading(true);
    // ✅ Find FD scheme for customer
    const scheme = customer.rdSchemes.find(
      s => s.rdAccountNumber == rdAccountNumber
    );
    if (!scheme) {
      alert("RD scheme not found for this customer");
      setLoading(false);
      return;
    }

    const data = calculateRDPayout(scheme);
    if (!data.canWithdraw) {
      alert("Premature withdrawal not allowed for this RD at this stage");
    }
    setMaturityData(data);
    setLoading(false);
  };

  const handleProceedToConfirmation = () => {
    if (!maturityData || !maturityData.canWithdraw) return;
    setShowConfirmation(true);
  };

  const handleFinalSubmit = async () => {
    if (!formData.savingAccountNumber || !formData.rdAccountNumber) return;

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/transactionSchemes/transaction/RD/maturityPay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: customer._id,
          rdAccountNumber: rdAccountNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show error message from API
        alert(data.message || "Error processing FD payout");
      } else {
        // Show success message
        alert(data.message || "RD payout processed successfully!");
        handleClose();
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("Server error occurred while processing FD payout");
    } finally {
      setLoading(false);
    }
  };


  const handleClose = () => {
    setIsOpen(false);
    setShowConfirmation(false);
    // setFormData({ savingAccountNumber: "", rdAccountNumber: "" });
    setMaturityData(null);
  };

  return (
    <div>
      {/* Trigger Button */}
      <div className="mt-6 flex justify-left text-left">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-500 mt-3 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
        >
          Premature Closure/RD Maturity
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">RD Maturity/Premature Closure</h2>
                  <p className="text-red-100 text-sm">Process RD deposit closure or maturity</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!showConfirmation ? (
                <>
                  {/* Input Fields */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Saving Ac <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        name="savingAccountNumber"
                        value={formData.savingAccountNumber}
                        onChange={handleInputChange}
                        placeholder="Enter Customer ID"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rd Account Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        disabled
                        name="rdAccountNumber"
                        value={formData.rdAccountNumber}
                        onChange={handleInputChange}
                        placeholder="Enter FD Account Number"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={handleCalculate}
                      disabled={loading || !formData.savingAccountNumber || !formData.rdAccountNumber}
                      className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Calculator className="w-5 h-5" />
                          Calculate Maturity Amount
                        </>
                      )}
                    </button>
                  </div>

                  {/* Maturity Details */}
                  {maturityData && (
                    <div className="mt-6 space-y-4">
                      {maturityData.isPremature && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800 mb-1">Premature Closure</h4>
                            <p className="text-sm text-yellow-700">
                              Penalty: {maturityData.penaltyRate}% will be applied
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                        <div className="flex justify-between"><span>Principal</span><span>₹{maturityData.principalDeposited.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Interest Earned</span><span>₹{maturityData.interestEarned.toLocaleString()}</span></div>
                        {/* <div className="flex justify-between"><span>Maturity Amount</span><span>₹{maturityData.maturityAmount.toLocaleString()}</span></div> */}
                        {maturityData.penalty > 0 && <div className="flex justify-between text-red-700"><span>Penalty</span><span>-₹{maturityData.penalty.toLocaleString()}</span></div>}
                        <div className="flex justify-between font-bold text-green-600 text-lg mt-2"><span>Net Payable</span><span>₹{maturityData.netPayable.toLocaleString()}</span></div>
                      </div>

                      <button
                        onClick={handleProceedToConfirmation}
                        disabled={!maturityData.canWithdraw}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Proceed to Confirmation
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* Confirmation Screen */
                <div className="space-y-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800">Confirm RD Closure</h3>
                  <p className="text-gray-600">Are you sure you want to process this RD closure? This action cannot be undone.</p>
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mt-4">
                    <div className="flex justify-between"><span>Saving Ac:</span><span>{formData.savingAccountNumber}</span></div>
                    <div className="flex justify-between"><span>RD Account:</span><span>{formData.rdAccountNumber}</span></div>
                    <div className="flex justify-between font-bold text-green-600 mt-3"><span>Amount to be Paid:</span><span>₹{maturityData.netPayable.toLocaleString()}</span></div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button onClick={() => setShowConfirmation(false)} className="flex-1 bg-gray-200 py-3 rounded-xl font-semibold">Go Back</button>
                    <button onClick={handleFinalSubmit} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" /> Confirm & Process</button>
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

export default RdMaturityModal;
