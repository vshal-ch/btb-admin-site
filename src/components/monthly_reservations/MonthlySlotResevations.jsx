// MonthlyReservations.jsx
import React, { useEffect, useState, useContext } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import MonthlyReservationModal from "./MonthlyReservationModal";
import MonthlyReservationDetailsModal from "./MonthlyReservationDetailsModal";
import {
  getMonthlyReservations,
  deleteMonthlyReservation,
} from "../../api/monthlyService";
import { AvailableSportsContext } from "../../util/availableSportsContext";
import { minutesToTime } from "../../util/utils";

const computeDisplayStatus = (reservation) => {
  const today = new Date().toISOString().split("T")[0];

  if (reservation.status === "cancelled") return "cancelled";
  if (reservation.status === "expired") return "expired";
  if (reservation.end_date < today) return "past end date";
  if (reservation.start_date > today) return "upcoming";
  return "active";
};

const StatusBadge = ({ status }) => {
  const styles = {
    active: "bg-green-500/20 text-green-400",
    upcoming: "bg-blue-500/20 text-blue-400",
    expired: "bg-gray-600/30 text-gray-300",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-700 text-gray-300"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
};

const MonthlyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const { availableSports } = useContext(AvailableSportsContext);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await getMonthlyReservations({
        status: statusFilter,
        search,
      });
      console.log(res);

      setReservations(res || []);
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter, search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this reservation?")) return;
    await deleteMonthlyReservation(id);
    fetchReservations();
  };

  const handleEdit = async (r) => {
    r.sportId = availableSports.find((sport) => sport.sport === r.sport)?.id;

    setSelectedReservation(r);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-green-500">
          Monthly Reservations
        </h1>

        <button
          onClick={() => {
            setSelectedReservation(null);
            setShowModal(true);
          }}
          className="bg-green-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add Reservation
        </button>
      </div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md p-2"
        >
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All</option>
        </select>

        <input
          placeholder="Search name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md p-2 flex-1"
        />
      </div>
      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-center">Sport</th>
              <th className="p-3 text-center">Box</th>
              <th className="p-3 text-center">Date Range</th>
              <th className="p-3 text-center">Time</th>
              <th className="p-3 text-center">Amount</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((r) => {
              const displayStatus = computeDisplayStatus(r);
              return (
                <tr
                  key={r.id}
                  className="border-t border-gray-800 hover:bg-gray-800/50"
                >
                  <td className="p-3">
                    <div>{r.customer_name}</div>
                    <div className="text-xs text-gray-500">
                      {r.customer_phone}
                    </div>
                  </td>

                  <td className="p-3 text-center">{r.sport}</td>
                  <td className="p-3 text-center">{r.box}</td>

                  <td className="p-3 text-center">
                    {r.start_date} → {r.end_date}
                  </td>

                  <td className="p-3 text-center">
                    {minutesToTime(r.start_time)} - {minutesToTime(r.end_time)}
                  </td>

                  <td className="p-3 text-center">₹{r.amount_paid}</td>

                  <td className="p-3 text-center">
                    <StatusBadge status={displayStatus} />
                  </td>

                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedReservation(r);
                        setShowDetails(true);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => {
                        handleEdit(r);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(r.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div>
        <div className="md:hidden space-y-4">
          {reservations.map((r) => {
            const displayStatus = computeDisplayStatus(r);

            return (
              <div
                key={r.id}
                className="bg-gray-900 rounded-2xl border border-gray-800 shadow-sm"
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-start">
                  <div>
                    <p className="text-base font-semibold text-white">
                      {r.customer_name}
                    </p>
                    <p className="text-sm text-gray-400">{r.customer_phone}</p>
                  </div>

                  <StatusBadge status={displayStatus} />
                </div>

                {/* Body */}
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sport</span>
                    <span className="text-gray-200">{r.sport}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Box</span>
                    <span className="text-gray-200">{r.box}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Date Range</span>
                    <span className="text-gray-200 text-right">
                      {r.start_date} → {r.end_date}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="text-gray-200">
                      {minutesToTime(r.start_time)} -{" "}
                      {minutesToTime(r.end_time)}
                    </span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Amount</span>
                    <span className="text-green-400">₹{r.amount_paid}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-3 border-t border-gray-800 flex justify-end gap-6">
                  <button
                    onClick={() => {
                      setSelectedReservation(r);
                      setShowDetails(true);
                    }}
                    className="text-blue-400"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => {
                      handleEdit(r);
                    }}
                    className="text-green-400"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {reservations.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-6">
            No reservations found
          </div>
        )}
      </div>
      {showModal && (
        <MonthlyReservationModal
          reservation={selectedReservation}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchReservations();
          }}
        />
      )}
      {showDetails && (
        <MonthlyReservationDetailsModal
          reservation={selectedReservation}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default MonthlyReservations;
