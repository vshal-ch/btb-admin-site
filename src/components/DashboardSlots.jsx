// DashboardSlots.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { Plus, Edit, Trash2, RefreshCw, ArrowRight } from "lucide-react";
import {
  getSlots,
  deleteSlot,
  saveSlot,
  verifyGamePass,
} from "../api/slotService";
import SlotModal from "./SlotModal";
import { minutesToTime } from "../util/utils";
import { AvailableSportsContext } from "../util/availableSportsContext";
import SlotDetailsModal from "./SlotDetailModal";

const today = new Date().toISOString().split("T")[0];

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const DashboardSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(1);

  const [filters, setFilters] = useState({
    dateType: "on_date", // all | on_date | from_date
    date: today,
    statuses: ["CONFIRMED"], // all | confirmed | expired | locked | failed
  });

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSlots, setTotalSlots] = useState(1);
  const limit = 10;

  const [showVerify, setShowVerify] = useState(false);
  const [gamePassCode, setGamePassCode] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verfiedSlotModal, setVerfiedSlotModal] = useState(false);

  const { availableSports } = useContext(AvailableSportsContext);

  const fetchSlots = async (noCache = false) => {
    setLoading(true);
    try {
      const res = await getSlots({ ...filters, page, limit }, noCache);

      setSlots(res.slots);
      setTotalSlots(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
      setShowStatusDropdown(false);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [page, filters]);

  const toggleStatus = (status) => {
    let updated = [...filters.statuses];

    if (status === "ALL") {
      updated = ["ALL"];
    } else {
      updated = updated.filter((s) => s !== "ALL");

      if (updated.includes(status)) {
        updated = updated.filter((s) => s !== status);
      } else {
        updated.push(status);
      }

      if (updated.length === 0) {
        updated = ["CONFIRMED"]; // fallback default
      }
    }

    setPage(1);
    setFilters((prev) => ({
      ...prev,
      statuses: updated,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    setLoading(true);
    try {
      await deleteSlot(id);
      setSelectedSlotId(null);
      await fetchSlots(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleEdit = async (slot) => {
    slot.sportId = availableSports.find(
      (sport) => sport.sport === slot.sport,
    )?.id;

    setEditSlot(slot);
    setShowModal(true);
  };

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      const savedSlotId = await saveSlot(formData, editSlot);
      setShowModal(false);
      setEditSlot(null);
      setSelectedSlotId(savedSlotId);
      editSlot && setRefreshKey((prev) => prev + 1);
      await fetchSlots(true);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!gamePassCode) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const result = await verifyGamePass("BTB-" + gamePassCode);
      setVerificationResult(result);
      setVerfiedSlotModal(true);
    } catch (err) {
      setVerificationResult({
        error: err || "Invalid or not found",
      });
    }

    setVerifying(false);
  };

  return (
    <div className="lg:p-4 w-full relative">
      {loading && (
        <div className="absolute rounded-md inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
          <div role="status">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-neutral-tertiary animate-spin fill-brand"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Slots</h2>
        <button
          className="bg-green-500 text-white px-3 py-2 rounded-md flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Add Slot
        </button>
      </div>

      {/* VERIFY GAME PASS SECTION */}
      <div className="mb-6 border border-gray-800 rounded-xl bg-gray-900">
        <button
          onClick={() => setShowVerify(!showVerify)}
          className="w-full flex justify-between items-center p-4 font-medium"
        >
          <span>Verify Game Pass</span>
          <span>{showVerify ? "▴" : "▾"}</span>
        </button>

        {showVerify && (
          <div className="border-t border-gray-800 p-4">
            <form className="space-y-4" onSubmit={handleVerifyCode}>
              <div>
                <label className="text-sm text-gray-400 block mb-1">
                  Enter Game Pass Code
                </label>
                <div
                  tabIndex={0}
                  className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3
                focus-within:ring-2 focus-within:ring-green-500"
                >
                  <span className="text-nowrap">BTB -</span>
                  <input
                    type="text"
                    value={gamePassCode}
                    onChange={(e) => setGamePassCode(e.target.value)}
                    placeholder="XXXXXX"
                    className="w-full py-2 text-white outline-none "
                  />
                </div>
              </div>

              <button
                type="submit"
                onClick={handleVerifyCode}
                className="bg-green-600 px-4 py-2 rounded-lg font-medium"
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>
            </form>
            {/* RESULT DISPLAY */}
            {verificationResult && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-2">
                {verificationResult.error ? (
                  <p className="text-red-400 font-medium">
                    {verificationResult.error}
                  </p>
                ) : (
                  <>
                    <div className="flex justify-center items-center gap-4">
                      <p className="text-green-400 font-semibold">
                        Valid Game Pass
                      </p>

                      <button
                        onClick={() => setVerfiedSlotModal(true)}
                        className="bg-green-600 px-3 py-1 rounded-lg font-medium flex items-center gap-2"
                      >
                        View Details
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col flex-wrap items-start gap-4 mb-4">
        <div className="flex items-start md:items-start gap-3 md:gap-8 md:flex-row flex-col">
          {/* Date Filter */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-medium mr-3">Date:</label>
            <div className="flex flex-col items-start lg:flex-row">
              <label className="mr-3">
                <input
                  type="radio"
                  radioGroup="date_type"
                  checked={filters.dateType === "all"}
                  onChange={() => {
                    setPage(1);
                    setFilters((prev) => ({
                      ...prev,
                      dateType: "all",
                    }));
                  }}
                  className="mr-1"
                />
                All
              </label>

              <div className="flex gap-1">
                <label className="mr-3">
                  <input
                    type="radio"
                    radioGroup="date_type"
                    checked={filters.dateType === "on_date"}
                    onChange={() => {
                      setPage(1);
                      setFilters((prev) => ({
                        ...prev,
                        dateType: "on_date",
                      }));
                    }}
                    className="mr-1"
                  />
                  On date
                </label>
                <label className="mr-3">
                  <input
                    type="radio"
                    radioGroup="date_type"
                    checked={filters.dateType === "from_date"}
                    onChange={() => {
                      setPage(1);
                      setFilters((prev) => ({
                        ...prev,
                        dateType: "from_date",
                      }));
                    }}
                    className="mr-1"
                  />
                  From date
                </label>
              </div>
            </div>

            {filters.dateType !== "all" && (
              <input
                type="date"
                value={filters.date}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    date: e.target.value,
                  }));
                }}
                className="bg-gray-700 rounded px-2 py-0.5"
              />
            )}
          </div>
          {/* STATUS FILTER */}
          <div className="relative flex flex-col items-start mt-2 lg:mt-0">
            <label className="font-medium mb-2">Status:</label>

            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="bg-gray-800 border border-gray-600 px-2 py-0.5 rounded w-52 text-left flex justify-between items-center"
            >
              <span>
                {filters.statuses.includes("ALL")
                  ? "ALL"
                  : filters.statuses.join(", ")}
              </span>
              <span>▾</span>
            </button>

            {showStatusDropdown && (
              <div
                ref={dropdownRef}
                className="absolute mt-2 w-52 bg-gray-900 border border-gray-700 rounded shadow-lg z-15 p-3"
              >
                {[
                  "ALL",
                  "CONFIRMED",
                  "EXPIRED",
                  "RESCHEDULED",
                  "LOCKED",
                  "FAILED",
                ].map((status) => (
                  <label key={status} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="mr-2"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-8 hidden md:block">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-green-500 text-white">
            <tr>
              {[
                "S.no",
                "Date",
                "Time",
                "Sport / Box",
                "Created by",
                "Status",
              ].map((h) => (
                <th key={h} className="p-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  No slots found
                </td>
              </tr>
            ) : (
              slots.map((s, i) => (
                <tr
                  key={s.id}
                  className="border-t cursor-pointer hover:bg-white/10 active:bg-white/40"
                  onClick={() => setSelectedSlotId(s.id)}
                >
                  <td className="p-2">{(page - 1) * limit + i + 1}</td>
                  <td className="p-2">{formatDate(s.date)}</td>
                  <td className="p-2">
                    {minutesToTime(s.start_time)} - {minutesToTime(s.end_time)}
                  </td>
                  <td className="p-2">
                    {s.sport} / {s.box}
                  </td>
                  <td className="p-2">{s.created_by_type}</td>
                  <td className="p-2 text-xs">{s.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4 mt-6">
        {slots.length === 0 ? (
          <div className="text-center p-4 text-gray-400">No slots found</div>
        ) : (
          <div>
            <p className="text-sm text-start mb-2">Total slots: {totalSlots}</p>
            {slots.map((s, i) => (
              <div
                key={s.id}
                onClick={() => setSelectedSlotId(s.id)}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-2 shadow-sm active:scale-[0.98] transition cursor-pointer"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-400">Serial No</p>
                    <p className="font-semibold text-white">
                      {(page - 1) * limit + i + 1}
                    </p>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      s.status === "CONFIRMED"
                        ? "bg-green-600/20 text-green-400"
                        : s.status === "FAILED"
                          ? "bg-red-600/20 text-red-400"
                          : s.status === "EXPIRED" || s.status === "RESCHEDULED"
                            ? "bg-yellow-600/20 text-yellow-400"
                            : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <div className="border-t border-gray-800 my-3"></div>

                <div className="flex justify-between items-center">
                  {/* Date & Time */}
                  <div>
                    <div className="flex flex-col items-start">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Date
                      </p>
                      <p className="text-white font-medium">
                        {new Date(s.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                        Time
                      </p>
                      <p className="text-white font-medium">
                        {minutesToTime(s.start_time)} –{" "}
                        {minutesToTime(s.end_time)}
                      </p>
                    </div>
                  </div>

                  {/* Sport & Box */}
                  <div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Sport
                      </p>
                      <p className="text-white">{s.sport}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mt-2">
                        Box
                      </p>
                      <p className="text-white">{s.box}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-800 my-3"></div>

                {/* Payment & Creator */}
                <div className="flex justify-between items-center">
                  <div className="flex items-start flex-col">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Total Amount
                    </p>
                    <p className="text-white font-semibold">
                      ₹ {s.total_amount}
                    </p>
                  </div>

                  <div className="text-right flex items-end flex-col">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Created By
                    </p>
                    <p className="text-white capitalize">{s.created_by_type}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <>
          {/* DESKTOP PAGINATION */}
          <div className="hidden md:flex justify-center items-center gap-3 mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
            >
              First
            </button>

            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
            >
              Prev
            </button>

            <div className="flex items-center gap-2">
              <span>Page</span>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={page}
                min={1}
                max={totalPages}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  if (!value) return;
                  if (value < 1) value = 1;
                  if (value > totalPages) value = totalPages;
                  setPage(value);
                }}
                className="w-16 text-center bg-gray-800 border border-gray-600 rounded"
              />
              <span>of {totalPages}</span>
            </div>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
            >
              Next
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
              className="px-3 py-1 bg-gray-700 rounded disabled:opacity-40"
            >
              Last
            </button>
          </div>

          {/* MOBILE PAGINATION */}
          <div className="md:hidden mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
            {/* Page Indicator */}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Page
              </p>
              <p className="text-lg font-semibold text-white">
                {page} / {totalPages}
              </p>
            </div>

            {/* Page Input */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">
                Go to page
              </label>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={page}
                min={1}
                max={totalPages}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  if (!value) return;
                  if (value < 1) value = 1;
                  if (value > totalPages) value = totalPages;
                  setPage(value);
                }}
                className="w-full text-center bg-gray-800 border border-gray-700 rounded-lg py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Navigation Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage(1)}
                className="bg-gray-800 py-3 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                First
              </button>

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="bg-gray-800 py-3 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                Prev
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="bg-gray-800 py-3 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                Next
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                className="bg-gray-800 py-3 rounded-lg text-sm font-medium disabled:opacity-40"
              >
                Last
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <SlotModal
          slot={editSlot}
          onClose={() => {
            setShowModal(false);
            setEditSlot(null);
          }}
          onSave={handleSave}
          availableSports={availableSports}
        />
      )}

      {selectedSlotId && (
        <SlotDetailsModal
          id={selectedSlotId}
          onClose={() => setSelectedSlotId(null)}
          onEdit={(slot) => handleEdit(slot)}
          onDelete={(id) => handleDelete(id)}
          refreshKey={refreshKey}
        />
      )}

      {verificationResult && verfiedSlotModal && (
        <SlotDetailsModal
          data={verificationResult}
          onClose={() => {
            setVerfiedSlotModal(false);
          }}
          onEdit={(slot) => handleEdit(slot)}
          onDelete={(id) => handleDelete(id)}
        />
      )}
    </div>
  );
};

export default DashboardSlots;
