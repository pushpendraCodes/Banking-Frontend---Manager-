import axios from "axios";
import { useEffect, useState, useCallback, useRef } from "react";
import { FaEye, FaChevronDown } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function Payments() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Enhanced filter states
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedAreaManager, setSelectedAreaManager] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTransactionType, setSelectedTransactionType] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [selectedSchemeType, setSelectedSchemeType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // "today" | "yesterday" | ""

  const manager = JSON.parse(sessionStorage.getItem("user"));
  const [agents, setAgents] = useState([]);
  const [areaManagers, setAreaManagers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Search states for dropdowns
  const [agentSearch, setAgentSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [areaManagerSearch, setAreaManagerSearch] = useState("");
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [areaManagerDropdownOpen, setAreaManagerDropdownOpen] = useState(false);

  // Refs for dropdown containers
  const agentDropdownRef = useRef(null);
  const customerDropdownRef = useRef(null);
  const areaManagerDropdownRef = useRef(null);

  // Predefined filter options
  const statusOptions = ["pending", "approved", "rejected"];
  const transactionTypeOptions = ["deposit", "withdrawal", "emi", "maturityPayout", "penality"];
  const modeOptions = ["cash", "bankTransfer", "upi", "cheque", "card"];
 const schemeTypeOptions = ["FD", "RD", "LOAN", "PIGMY","SAVING_ACCOUNT","Lakhpati","MIP"];


  const managerId = JSON.parse(sessionStorage.getItem("user"))._id
  const token = sessionStorage.getItem("token");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchAreaManagers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/areaManager?managerId=${managerId}&all=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }

      );
      setAreaManagers(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/customer?managerId=${managerId}&all=true`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCustomers(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  // Fetch transactions with enhanced filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: debouncedSearch,
        page,
        limit,
        managerId: manager._id,
      };

      // Add all filter parameters
      if (selectedAgent) params.agentId = selectedAgent;
      if (selectedCustomer) params.customerId = selectedCustomer;
      if (selectedAreaManager) params.areaManagerId = selectedAreaManager;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedTransactionType) params.transactionType = selectedTransactionType;
      if (selectedMode) params.mode = selectedMode;
      if (selectedSchemeType) params.schemeType = selectedSchemeType;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (dateFilter) params.filter = dateFilter; // pass today/yesterday filter

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/transactionSchemes/transactions`,
        {
          params, headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setData(response.data.transactions || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    page,
    limit,
    selectedAgent,
    selectedCustomer,
    selectedAreaManager,
    selectedStatus,
    selectedTransactionType,
    selectedMode,
    selectedSchemeType,
    fromDate,
    toDate,
    dateFilter,
    manager._id
  ]);

  // Fetch agent list
  const fetchAgents = useCallback(async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/manager/agents/${manager._id}`,
        {
          params: { all: true },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAgents(response.data?.data || []);
    } catch {
      setAgents([]);
    }
  }, [manager._id]);

  useEffect(() => {
    fetchAgents();
    fetchAreaManagers();
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target)) {
        setAgentDropdownOpen(false);
      }
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setCustomerDropdownOpen(false);
      }
      if (areaManagerDropdownRef.current && !areaManagerDropdownRef.current.contains(event.target)) {
        setAreaManagerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset all filters function
  const resetAllFilters = () => {
    setSelectedAgent("");
    setSelectedCustomer("");
    setSelectedAreaManager("");
    setSelectedStatus("");
    setSelectedTransactionType("");
    setSelectedMode("");
    setSelectedSchemeType("");
    setFromDate("");
    setToDate("");
    setDateFilter("");
    setSearch("");
    setAgentSearch("");
    setCustomerSearch("");
    setAreaManagerSearch("");
    setPage(1);
  };

  // Filter functions for searchable dropdowns
  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredAreaManagers = areaManagers.filter(manager =>
    manager.name.toLowerCase().includes(areaManagerSearch.toLowerCase())
  );

  // Get selected names for display
  const getSelectedAgentName = () => {
    const agent = agents.find(a => a._id === selectedAgent);
    return agent ? agent.name : "";
  };

  const getSelectedCustomerName = () => {
    const customer = customers.find(c => c._id === selectedCustomer);
    return customer ? customer.name : "";
  };

  const getSelectedAreaManagerName = () => {
    const manager = areaManagers.find(m => m._id === selectedAreaManager);
    return manager ? manager.name : "";
  };

  // Accept transaction API call and optimistic update
  const handleAccept = async (id, status) => {
    try {
      const confirm = window.confirm(`Are you sure you want to ${status} this transaction?`);
      if (!confirm) return; // ❌ stop if user cancels

      const body = { status, managerId: manager._id };
      await axios.post(
        `${import.meta.env.VITE_API_URL}/transactionSchemes/transaction/approvedReject/${id}`,
        body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      );

      setData((prev) =>
        prev.map((trx) =>
          trx._id === id ? { ...trx, status } : trx
        )
      );
    } catch (err) {
      alert("Failed to accept transaction");
    }
  };

  // Status color helper
  const statusColorClass = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "text-green-600 font-semibold";
      case "rejected":
        return "text-red-600 font-semibold";
      case "pending":
        return "text-yellow-600 font-semibold";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex gap-2 bg-gradient-to-br from-orange-500 via-red-500 to-red-600 p-4 rounded-md items-center mb-6">
        <h2 className="text-2xl font-bold">Payments</h2>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={resetAllFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Clear All Filters
          </button>
        </div>

        {/* First Row - Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Agent Filter - Searchable */}
          <div className="relative" ref={agentDropdownRef}>
            <div
              className="border border-gray-400 rounded px-3 py-2 w-full cursor-pointer flex justify-between items-center bg-white"
              onClick={() => setAgentDropdownOpen(!agentDropdownOpen)}
            >
              <span className={selectedAgent ? "text-black" : "text-gray-500"}>
                {selectedAgent ? getSelectedAgentName() : "All Agents"}
              </span>
              <FaChevronDown className={`transition-transform ${agentDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {agentDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setSelectedAgent("");
                    setAgentDropdownOpen(false);
                    setAgentSearch("");
                    setPage(1);
                  }}
                >
                  <span>All Agents</span>
                  {!selectedAgent && <span className="text-blue-500">✓</span>}
                </div>
                {filteredAgents.map((agent) => (
                  <div
                    key={agent._id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setSelectedAgent(agent._id);
                      setAgentDropdownOpen(false);
                      setAgentSearch("");
                      setPage(1);
                    }}
                  >
                    <span>{agent.name}</span>
                    {selectedAgent === agent._id && <span className="text-blue-500">✓</span>}
                  </div>
                ))}
                {filteredAgents.length === 0 && agentSearch && (
                  <div className="px-3 py-2 text-gray-500">No agents found</div>
                )}
              </div>
            )}
          </div>

          {/* Customer Filter - Searchable */}
          <div className="relative" ref={customerDropdownRef}>
            <div
              className="border border-gray-400 rounded px-3 py-2 w-full cursor-pointer flex justify-between items-center bg-white"
              onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
            >
              <span className={selectedCustomer ? "text-black" : "text-gray-500"}>
                {selectedCustomer ? getSelectedCustomerName() : "All Customers"}
              </span>
              <FaChevronDown className={`transition-transform ${customerDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {customerDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setSelectedCustomer("");
                    setCustomerDropdownOpen(false);
                    setCustomerSearch("");
                    setPage(1);
                  }}
                >
                  <span>All Customers</span>
                  {!selectedCustomer && <span className="text-blue-500">✓</span>}
                </div>
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer._id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setSelectedCustomer(customer._id);
                      setCustomerDropdownOpen(false);
                      setCustomerSearch("");
                      setPage(1);
                    }}
                  >
                    <span>{customer.name}</span>
                    {selectedCustomer === customer._id && <span className="text-blue-500">✓</span>}
                  </div>
                ))}
                {filteredCustomers.length === 0 && customerSearch && (
                  <div className="px-3 py-2 text-gray-500">No customers found</div>
                )}
              </div>
            )}
          </div>

          {/* Area Manager Filter - Searchable */}
          <div className="relative" ref={areaManagerDropdownRef}>
            <div
              className="border border-gray-400 rounded px-3 py-2 w-full cursor-pointer flex justify-between items-center bg-white"
              onClick={() => setAreaManagerDropdownOpen(!areaManagerDropdownOpen)}
            >
              <span className={selectedAreaManager ? "text-black" : "text-gray-500"}>
                {selectedAreaManager ? getSelectedAreaManagerName() : "All Area Managers"}
              </span>
              <FaChevronDown className={`transition-transform ${areaManagerDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            {areaManagerDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b">
                  <input
                    type="text"
                    placeholder="Search area managers..."
                    value={areaManagerSearch}
                    onChange={(e) => setAreaManagerSearch(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setSelectedAreaManager("");
                    setAreaManagerDropdownOpen(false);
                    setAreaManagerSearch("");
                    setPage(1);
                  }}
                >
                  <span>All Area Managers</span>
                  {!selectedAreaManager && <span className="text-blue-500">✓</span>}
                </div>
                {filteredAreaManagers.map((manager) => (
                  <div
                    key={manager._id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                      setSelectedAreaManager(manager._id);
                      setAreaManagerDropdownOpen(false);
                      setAreaManagerSearch("");
                      setPage(1);
                    }}
                  >
                    <span>{manager.name}</span>
                    {selectedAreaManager === manager._id && <span className="text-blue-500">✓</span>}
                  </div>
                ))}
                {filteredAreaManagers.length === 0 && areaManagerSearch && (
                  <div className="px-3 py-2 text-gray-500">No area managers found</div>
                )}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <select
            className="border border-gray-400 rounded px-3 py-2 w-full"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Second Row - More Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Transaction Type Filter */}
          <select
            className="border border-gray-400 rounded px-3 py-2 w-full"
            value={selectedTransactionType}
            onChange={(e) => {
              setSelectedTransactionType(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by transaction type"
          >
            <option value="">All Transaction Types</option>
            {transactionTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {/* Mode Filter */}
          <select
            className="border border-gray-400 rounded px-3 py-2 w-full"
            value={selectedMode}
            onChange={(e) => {
              setSelectedMode(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by mode"
          >
            <option value="">All Modes</option>
            {modeOptions.map((mode) => (
              <option key={mode} value={mode}>
                {mode.replace('_', ' ').charAt(0).toUpperCase() + mode.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>

          {/* Scheme Type Filter */}
          <select
            className="border border-gray-400 rounded px-3 py-2 w-full"
            value={selectedSchemeType}
            onChange={(e) => {
              setSelectedSchemeType(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by scheme type"
          >
            <option value="">All Scheme Types</option>
            {schemeTypeOptions.map((scheme) => (
              <option key={scheme} value={scheme}>
                {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search By Ledger Number"
            className="border border-gray-400 rounded px-3 py-2 w-full"
            aria-label="Search payments by ledger number"
          />
        </div>

        {/* Third Row - Date Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* From Date */}
          <div className="flex flex-col">
            <label htmlFor="fromDate" className="text-sm font-medium mb-1">From Date</label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setPage(1);
                if (dateFilter) setDateFilter(""); // Clear quick date filter
              }}
              className="border border-gray-400 rounded px-3 py-2 w-full"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col">
            <label htmlFor="toDate" className="text-sm font-medium mb-1">To Date</label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setPage(1);
                if (dateFilter) setDateFilter(""); // Clear quick date filter
              }}
              className="border border-gray-400 rounded px-3 py-2 w-full"
            />
          </div>

          {/* Quick Date Filter Buttons */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Quick Date Filters</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDateFilter("today");
                  setFromDate("");
                  setToDate("");
                }}
                className={`px-3 py-2 rounded font-semibold border text-xs ${dateFilter === "today"
                    ? "bg-yellow-400 text-white border-yellow-400"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-yellow-50"
                  }`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setDateFilter("yesterday");
                  setFromDate("");
                  setToDate("");
                }}
                className={`px-3 py-2 rounded font-semibold border text-xs ${dateFilter === "yesterday"
                    ? "bg-yellow-400 text-white border-yellow-400"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-yellow-50"
                  }`}
              >
                Yesterday
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border">Sr.</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Account Type</th>
              <th className="px-4 py-2 border">Ledger No</th>
              <th className="px-4 py-2 border">Customer</th>
              <th className="px-4 py-2 border">Amount</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">Mode</th>
              <th className="px-4 py-2 border">Action</th>
              <th className="px-4 py-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-500">
                  Loading data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-red-500">
                  Error: {error.message}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              data.map((trx, idx) => (
                <tr
                  key={trx._id}
                  className="odd:bg-white even:bg-yellow-50 hover:bg-yellow-100 transition"
                >
                  <td className="px-4 py-2 border">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(trx.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">{trx.schemeType}</td>
                  <td className="px-4 py-2 border">{trx.accountNumber}</td>
                  <td className="px-4 py-2 border">
                    {trx.customerId?.name || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">{trx.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border capitalize">
                    {trx.transactionType || "N/A"}
                  </td>
                  <td className="px-4 py-2 border capitalize">
                    {trx.mode?.replace('_', ' ') || "N/A"}
                  </td>
                  <td className="px-4 py-2 border">
                    {trx.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
                          onClick={() => handleAccept(trx._id, "approved")}
                        >
                          Accept
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                          onClick={() => handleAccept(trx._id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={statusColorClass(trx.status)}>
                        {trx.status}
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-2 border flex gap-3 items-center capitalize ${statusColorClass(trx.status)}`}>
                    {trx.status}
                    <button onClick={() => navigate(`/payments/view/${trx._id}`)}>
                      <FaEye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled={page === 1 || loading}
          onClick={() => setPage((p) => p - 1)}
          className={`px-4 py-1 border rounded ${page === 1 || loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
            }`}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages} ({totalItems} Payments)
        </span>
        <button
          disabled={page === totalPages || loading}
          onClick={() => setPage((p) => p + 1)}
          className={`px-4 py-1 border rounded ${page === totalPages || loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-100"
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}