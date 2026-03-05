// SlotDetailsDrawer.jsx
import React from "react";
import { X } from "lucide-react";
import { minutesToTime } from "../util/utils";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const SlotDetailsDrawer = ({ slot, onClose }) => {
  if (!slot) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
      <div className="w-full md:w-[420px] bg-gray-900 h-full p-6 overflow-y-auto shadow-xl">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Slot Details</h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BASIC DETAILS */}
        <div className="mb-6 space-y-2">
          <h4 className="font-semibold text-green-400">Basic Info</h4>
          <p><strong>Date:</strong> {formatDate(slot.date)}</p>
          <p>
            <strong>Time:</strong> {minutesToTime(slot.start_time)} -{" "}
            {minutesToTime(slot.end_time)}
          </p>
          <p><strong>Sport:</strong> {slot.sport}</p>
          <p><strong>Box:</strong> {slot.box}</p>
          <p><strong>Status:</strong> {slot.status}</p>
        </div>

        {/* PAYMENT DETAILS */}
        <div className="mb-6 space-y-2">
          <h4 className="font-semibold text-green-400">Payment Details</h4>
          <p><strong>Total Amount:</strong> ₹ {slot.total_amount}</p>
          <p><strong>Game Pass Code:</strong> {slot.game_pass_code || "-"}</p>
        </div>

        {/* USER DETAILS */}
        <div className="mb-6 space-y-2">
          <h4 className="font-semibold text-green-400">User</h4>
          <p><strong>User ID:</strong> {slot.user_id || "-"}</p>
          <p><strong>Created By:</strong> {slot.created_by_type}</p>
        </div>

        {/* AUDIT DETAILS */}
        <div className="space-y-2">
          <h4 className="font-semibold text-green-400">Audit</h4>
          <p><strong>Created At:</strong> {new Date(slot.created_at).toLocaleString()}</p>
          <p><strong>Updated At:</strong> {new Date(slot.updated_at).toLocaleString()}</p>
          <p><strong>Last Updated By:</strong> {slot.last_updated_by_type || "-"}</p>
        </div>

      </div>
    </div>
  );
};

export default SlotDetailsDrawer;
