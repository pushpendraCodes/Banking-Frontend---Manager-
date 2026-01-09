import { useState } from "react";
import { FaPiggyBank, FaTimes } from "react-icons/fa";

const DepositBalanceModal = ({ onDeposit ,customerId}) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return alert("Enter valid amount");
    onDeposit({amount:Number(amount) ,customerId});
    setAmount("");
    setOpen(false);
  };

  return (
    <>
      {/* Deposit Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white 
                   rounded-lg hover:bg-green-700 shadow"
      >
        <FaPiggyBank />
        {/* Deposit Balance */}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
            
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaPiggyBank className="text-green-600" />
              Deposit Balance
            </h2>

            {/* Amount Input */}
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Deposit
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default DepositBalanceModal;
