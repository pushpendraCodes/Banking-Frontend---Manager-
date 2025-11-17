import React, { useState } from "react";
import { X, DollarSign, AlertTriangle, CheckCircle, Calculator } from "lucide-react";
import moment from "moment";

const PigmyMaturityModal = ({ customer, pigMyAccountNumber }) => {
    console.log(pigMyAccountNumber, "pigmyAccountNumber")
    const token = sessionStorage.getItem("token");
    const [isOpen, setIsOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [formData, setFormData] = useState({
        savingAccountNumber: customer?.savingAccountNumber,
        pigmyAccountNumber: pigMyAccountNumber,
    });
    const [maturityData, setMaturityData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🟢 Pigmy maturity / premature payout calculation
    const calculatePigmyPayout = (scheme) => {
        if (!scheme) return null;

        const dailyDeposit = Number(scheme.pigmyDailyDeposit);
        const tenureMonths = Number(scheme.pigMyTenure);
        const rate = Number(scheme.pigMyInterestRate) / 100 || 0.05; // default 5%
        const openingDate = new Date(scheme.pigMyOpeningDate);
        const now = new Date();
        const elapsedMonths = moment(now).diff(moment(openingDate), "months");
        const elapsedDays = moment(now).diff(moment(openingDate), "days");

        // Principal actually deposited till now
        const principal = scheme.pigMyTotalDepositedAmount

        let interestEarned = 0;
        let penalty = 0;
        let canWithdraw = true;
        let isPremature = elapsedMonths < tenureMonths;

        if (tenureMonths === 6) {
            // 🟢 6 month Pigmy rules
            if (elapsedDays < 60 || elapsedMonths < 2) {
                canWithdraw = false;
            } else if (elapsedMonths >= 1 && elapsedMonths < 3) {
                penalty = principal * 0.05; // 5% cut
            } else if (elapsedMonths >= 4 && elapsedMonths < 6) {
                penalty = principal * 0.02; // 2% cut
            } else if (elapsedMonths >= 6) {
                interestEarned = principal * rate * (elapsedMonths / 12);
            }
        } else if (tenureMonths === 12) {
            // 🟢 12 month Pigmy rules
            if (elapsedDays < 90 || elapsedMonths < 3) {
                canWithdraw = false;
            } else if (elapsedMonths >= 3 && elapsedMonths < 6) {
                penalty = principal * 0.06; // 6% service charge
            } else if (elapsedMonths >= 6 && elapsedMonths < 9) {
                penalty = principal * 0.02; // 2% service charge
            } else if (elapsedMonths >= 9 && elapsedMonths < 12) {
                penalty = 0; // no interest before 12m
            } else if (elapsedMonths >= 12) {
                interestEarned = principal * rate * (elapsedMonths / 12);
            }
        }

        const netPayable =
            (Number(principal) || 0) + (Number(interestEarned) || 0) - (Number(penalty) || 0);



        return {
            principalDeposited: principal,
            interestEarned,
            penalty,
            netPayable: netPayable < 0 ? 0 : netPayable,
            elapsedMonths,
            tenureMonths,
            isPremature,
            canWithdraw,
        };
    };

    const handleCalculate = (e) => {
        e.preventDefault();
        if (!formData.savingAccountNumber || !formData.pigmyAccountNumber) return;

        setLoading(true);
        const scheme = customer.pigmy.find(
            (s) => s.pigMyAccountNumber === pigMyAccountNumber
        );

        if (!scheme) {
            alert("Pigmy scheme not found for this customer");
            setLoading(false);
            return;
        }

        const data = calculatePigmyPayout(scheme);
        if (!data.canWithdraw) {
            alert("Premature withdrawal not allowed for this Pigmy account at this stage");
        }
        setMaturityData(data);
        setLoading(false);
    };

    const handleProceedToConfirmation = () => {
        if (!maturityData || !maturityData.canWithdraw) return;
        setShowConfirmation(true);
    };

    const handleFinalSubmit = async () => {
        if (!formData.savingAccountNumber || !formData.pigmyAccountNumber) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/transactionSchemes/transaction/pigmy/maturityPay`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        customerId: customer._id,
                        pigmyAccountNumber: pigMyAccountNumber,
                    }),
                }
            );

            const data = await response.json();
            if (!response.ok) {
                alert(data.message || "Error processing Pigmy payout");
            } else {
                alert(data.message || "Pigmy payout processed successfully!");
                handleClose();
            }
        } catch (err) {
            console.error("API Error:", err);
            alert("Server error occurred while processing Pigmy payout");
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
                    className="bg-red-600 hover:bg-red-500 mt-3 text-white px-4 py-2 rounded-lg shadow-md transition duration-200"
                >
                    Premature Closure / Pigmy Maturity
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
                                    <h2 className="text-2xl font-bold text-white">Pigmy Maturity / Premature Closure</h2>
                                    <p className="text-red-100 text-sm">Process Pigmy deposit closure or maturity</p>
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
                                                Saving Account <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                name="savingAccountNumber"
                                                value={formData.savingAccountNumber}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Pigmy Account Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                disabled
                                                name="pigmyAccountNumber"
                                                value={formData.pigmyAccountNumber}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                                            />
                                        </div>
                                        <button
                                            onClick={handleCalculate}
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                            Some penalties or service charges have been applied
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                                                <div className="flex justify-between"><span>Principal</span><span>₹{maturityData.principalDeposited.toLocaleString()}</span></div>
                                                <div className="flex justify-between"><span>Interest Earned</span><span>₹{maturityData.interestEarned.toLocaleString()}</span></div>
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
                                    <h3 className="text-2xl font-bold text-gray-800">Confirm Pigmy Closure</h3>
                                    <p className="text-gray-600">Are you sure you want to process this Pigmy closure? This action cannot be undone.</p>
                                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mt-4">
                                        <div className="flex justify-between"><span>Saving Ac:</span><span>{formData.savingAccountNumber}</span></div>
                                        <div className="flex justify-between"><span>Pigmy Account:</span><span>{formData.pigmyAccountNumber}</span></div>
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

export default PigmyMaturityModal;
