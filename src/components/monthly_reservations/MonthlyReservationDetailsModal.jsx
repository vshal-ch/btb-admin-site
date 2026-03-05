// MonthlyReservationDetailsModal.jsx
import React from "react";
import { minutesToTime } from "../../util/utils";

const MonthlyReservationDetailsModal = ({ reservation, onClose }) => {
  if (!reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-md rounded-2xl shadow-xl">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-green-500">
            Reservation Details
          </h2>
        </div>

        <div className="px-6 py-4 space-y-3 text-sm">
          <div>
            <strong>Customer:</strong> {reservation.customer_name}
          </div>
          <div>
            <strong>Phone:</strong> {reservation.customer_phone}
          </div>
          <div>
            <strong>Sport:</strong> {reservation.sport}
          </div>
          <div>
            <strong>Box:</strong> {reservation.box}
          </div>
          <div>
            <strong>Date:</strong> {reservation.start_date} →{" "}
            {reservation.end_date}
          </div>
          <div>
            <strong>Time:</strong> {minutesToTime(reservation.start_time)} -{" "}
            {minutesToTime(reservation.end_time)}
          </div>
          <div>
            <strong>Amount:</strong> ₹{reservation.amount_paid}
          </div>
          <div>
            <strong>Status:</strong> {reservation.status}
          </div>
          {reservation.notes && (
            <div>
              <strong>Notes:</strong> {reservation.notes}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 rounded-md text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReservationDetailsModal;
