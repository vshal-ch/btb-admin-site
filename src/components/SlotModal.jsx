import React, { useState } from "react";

function getDefaultHour() {
  const hour = new Date().getHours();
  if (hour >= 23 && hour <= 4) {
    return 5;
  }
  return hour;
}

const SlotModal = ({ slot, onClose, onSave }) => {
  const [date, setDate] = useState(
    slot?.date || new Date().toISOString().split("T")[0]
  );
  const [startHour, setStartHour] = useState(
    slot ? Math.floor(slot.start_time / 60) : getDefaultHour() + 1
  );
  const [startMinute, setStartMinute] = useState(
    slot ? slot.start_time % 60 : 0
  );
  const [endHour, setEndHour] = useState(
    slot ? Math.floor(slot.end_time / 60) : getDefaultHour() + 2
  );
  const [endMinute, setEndMinute] = useState(slot ? slot.end_time % 60 : 0);
  const [blocked, setBlocked] = useState(slot?.blocked || true);
  const [note, setNote] = useState(slot?.note || "");
  const [error, setError] = useState("");

  const sanitizeNote = (text) => {
    return text.replace(/[<>/'"\\;]/g, ""); // basic XSS/SQLi sanitization
  };

  const validateAndSubmit = () => {
    setError("");

    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    const today = new Date().toISOString().split("T")[0];
    if (new Date(date) < new Date(today)) {
      setError("Date must be today or a future date.");
      return;
    }
    if (startTime >= endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }
    if (startTime < 360 || endTime > 1440) {
      setError("Slot must be between 6:00 AM and 12:00 AM.");
      return;
    }

    const payload = {
      start_time: startTime,
      end_time: endTime,
      note: sanitizeNote(note.trim()),
      blocked,
      date,
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-30">
      <div className="bg-gray-900 rounded-2xl p-6 w-[90%] max-w-md relative shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-green-600">
          {slot ? "Edit Slot" : "Add New Slot"}
        </h2>

        {/* Date */}
        <div className="mb-3">
          <label className="block font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Time pickers */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block font-medium mb-1">Start Time</label>
            <div className="flex gap-2">
              <select
                value={startHour}
                onChange={(e) => setStartHour(+e.target.value)}
                className="bg-gray-800 border rounded-md p-2 w-full"
              >
                {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select
                value={startMinute}
                onChange={(e) => setStartMinute(+e.target.value)}
                className="bg-gray-800 border rounded-md p-2 w-full"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">End Time</label>
            <div className="flex gap-2">
              <select
                value={endHour}
                onChange={(e) => setEndHour(+e.target.value)}
                className="bg-gray-800 border rounded-md p-2 w-full"
              >
                {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => (
                  <option key={h} value={h}>
                    {h.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select
                value={endMinute}
                onChange={(e) => setEndMinute(+e.target.value)}
                className="bg-gray-800 border rounded-md p-2 w-full"
              >
                {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blocked checkbox */}
        <div className="flex items-center gap-2 mb-3 text-xl mt-4">
          <input
            type="checkbox"
            checked={blocked}
            onChange={(e) => setBlocked(e.target.checked)}
          />
          <label>Blocked</label>
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Enter note..."
            className="w-full border rounded-md p-2 resize-none"
            rows={2}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm mb-2 text-center">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={validateAndSubmit}
            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlotModal;
