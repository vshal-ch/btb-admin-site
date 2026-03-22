// MonthlyReservationModal.jsx
import React, { useState, useContext } from "react";
import { saveMonthlyReservation } from "../../api/monthlyService";
import { AvailableSportsContext } from "../../util/availableSportsContext";

const generateTimeOptions = () => {
  const times = [];
  for (let mins = 0; mins <= 36; mins++) {
    const h = Math.floor((mins + 12) / 2);
    const m = mins % 2 == 0 ? 0 : 30;
    const label = new Date(0, 0, 0, h, m).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    times.push({ value: mins, label });
  }
  return times;
};

const timeOptions = generateTimeOptions();

const MonthlyReservationModal = ({ reservation, onClose, onSave }) => {
  const { availableSports } = useContext(AvailableSportsContext);

  const [sportId, setSportId] = useState(
    reservation?.sportId || availableSports?.[0]?.id || "",
  );

  const [startDate, setStartDate] = useState(reservation?.start_date || "");
  const [endDate, setEndDate] = useState(reservation?.end_date || "");
  const [startTime, setStartTime] = useState(reservation?.start_time || 0);
  const [endTime, setEndTime] = useState(reservation?.end_time || 2);
  const [customerName, setCustomerName] = useState(
    reservation?.customer_name || "",
  );
  const [customerPhone, setCustomerPhone] = useState(
    reservation?.customer_phone || "",
  );
  const [amountPaid, setAmountPaid] = useState(reservation?.amount_paid || "");
  const [status, setStatus] = useState(reservation?.status || "active");
  const [notes, setNotes] = useState(reservation?.notes || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const validateAndSubmit = async () => {
    setError("");

    if (!sportId) {
      setError("Sport selection is required.");
      return;
    }

    if (!startDate || !endDate) {
      setError("Start and end dates are required.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    if (startTime >= endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    const payload = {
      id: reservation?.id,
      sport_id: sportId, // ✅ IMPORTANT
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      customer_name: customerName,
      customer_phone: customerPhone,
      amount_paid: Number(amountPaid) || 0,
      status,
      notes,
    };

    try {
      setSaving(true);

      const response = await saveMonthlyReservation(payload);

      if (response.warning) {
        const proceed = window.confirm(response.message);
        if (!proceed) {
          setSaving(false);
          return;
        }
        await saveMonthlyReservation(payload, true);
      }

      onSave();
    } catch (err) {
      setError(err || "Failed to save reservation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-green-500">
            {reservation
              ? "Edit Monthly Reservation"
              : "Add Monthly Reservation"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6">
          {/* Sport Section */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Sport
            </label>
            <select
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
            >
              {availableSports?.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.sport}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Date Range
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              Time Slot
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
              >
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    Start: {t.label}
                  </option>
                ))}
              </select>

              <select
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
              >
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    End: {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Customer Name
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Customer Phone
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
            </div>
          </div>

          {/* Payment & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Amount Paid
              </label>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              >
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`w-full px-6 py-4 border-t border-gray-800 flex gap-3 items-center
            ${error ? "justify-between" : "justify-end"}
          `}
        >
          {error && (
            <div className="bg-red-500/10 justify-self-start border border-red-500/30 text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 items-center">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={validateAndSubmit}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Reservation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReservationModal;
