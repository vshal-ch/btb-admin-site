import React, { useState } from "react";

const generateTimeOptions = () => {
  const times = [];
  for (let mins = 0; mins <= 36; mins++) {
    const hours = Math.floor((mins + 12) / 2);
    const minutes = mins % 2 == 0 ? 0 : 30;
    const label = new Date(0, 0, 0, hours, minutes).toLocaleTimeString(
      "en-IN",
      { hour: "2-digit", minute: "2-digit", hour12: true },
    );
    times.push({ value: mins, label });
  }
  return times;
};

const timeOptions = generateTimeOptions();

const SlotModal = ({ slot, onClose, onSave, availableSports }) => {
  const [date, setDate] = useState(
    slot?.date || new Date().toISOString().split("T")[0],
  );

  const [startTime, setStartTime] = useState(slot?.start_time || 0);

  const [endTime, setEndTime] = useState(slot?.end_time || 2);

  const [status, setStatus] = useState(slot?.status || "CONFIRMED");

  const [amountPaid, setAmountPaid] = useState(slot?.total_amount || "");

  const [note, setNote] = useState(slot?.note || "");
  const [error, setError] = useState("");

  const [selectedSportId, setSelectedSportId] = useState(
    slot?.sportId || availableSports[0]?.id,
  );

  const validateAndSubmit = () => {
    setError("");

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      setError("Invalid date selected.");
      return;
    }

    // 1️⃣ Start < End
    if (startTime >= endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }

    // 2️⃣ Operating hours (6 AM – 12 AM)
    if (startTime < 0 || endTime > 36) {
      setError("Slot must be between 6:00 AM and 12:00 AM.");
      return;
    }

    const payload = {
      start_time: startTime,
      end_time: endTime,
      date,
      status,
      total_amount: Number(amountPaid) || 0,
      sport_id: selectedSportId,
      note: note.trim(),
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-green-500">
            {slot ? "Edit Slot" : "Add New Slot"}
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-4 overflow-y-auto space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
            </div>

            {/* Sport */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sport</label>
              <select
                value={selectedSportId}
                onChange={(e) => setSelectedSportId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              >
                {availableSports.map((sport) => (
                  <option key={sport.id} value={sport.id}>
                    {sport.sport}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              >
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(Number(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              >
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
            >
              <option value="CONFIRMED">Confirmed</option>
              <option value="UNCONFIRMED">Unconfirmed</option>
            </select>
          </div>
          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Amount Paid
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              min="0"
              step="1"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Note</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
              className="px-4 py-2 rounded-md border border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={validateAndSubmit}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotModal;
