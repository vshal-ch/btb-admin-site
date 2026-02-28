import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { minutesToTime } from "../util/utils";
import { getSlotDetails, markSlotAttended } from "../api/slotService";
import { Copy, Check } from "lucide-react";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const getSlotAttendedStatus = (date, start_time, end_time) => {
  const now = new Date();
  start_time += 12;
  end_time += 12;
  const startHours = Math.floor(start_time / 2);
  const startMinutes = start_time % 2 === 0 ? 0 : 30;

  const endHours = Math.floor(end_time / 2);
  const endMinutes = end_time % 2 === 0 ? 0 : 30;

  const slotStart = new Date(date);
  slotStart.setHours(startHours, startMinutes, 0, 0);

  const slotEnd = new Date(date);
  slotEnd.setHours(endHours, endMinutes, 0, 0);

  if (now < slotStart) {
    const diffMinutes = Math.floor((slotStart - now) / 60000);
    if (diffMinutes <= 30) return `In ${diffMinutes}min`;
    return "UPCOMING";
  }

  if (now >= slotStart && now <= slotEnd) {
    return "ONGOING";
  }

  return "COMPLETED";
};

const getAttendanceEligibility = (slot) => {
  if (!slot) return { allowed: false, reason: "" };
  if (slot.status !== "CONFIRMED") {
    return {
      allowed: false,
      reason: "Only confirmed slots can be marked attended.",
    };
  }
  if (slot.attended) {
    return {
      allowed: false,
      reason: "This slot is already marked as attended.",
    };
  }

  const now = new Date();

  const hours = Math.floor(slot.start_time / 2);
  const minutes = slot.start_time % 2 === 0 ? 0 : 30;

  const slotStart = new Date(slot.date);
  slotStart.setHours(hours, minutes, 0, 0);

  const diffMinutes = Math.floor((slotStart - now) / 60000);

  // Past
  if (diffMinutes <= 0) {
    return { allowed: true };
  }

  // Within 15 minutes
  if (diffMinutes <= 15) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason:
      "You can mark attendance only within 15 minutes before start time or after it starts.",
  };
};

const getDisplayStatus = (slot, slotAttendedStatus) => {
  if (slot.status !== "CONFIRMED") return null;

  // Attendance overrides everything
  if (slot.attended) return "ATTENDED";

  // If completed but not attended
  if (slotAttendedStatus === "COMPLETED") {
    return "NOT ATTENDED";
  }

  return slotAttendedStatus;
};

const SlotDetailsModal = ({
  id,
  data,
  onClose,
  onEdit,
  onDelete,
  refreshKey,
}) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(data || null);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (!open) return; // only when modal is open

    window.history.pushState({ modalOpen: true }, "");

    const handlePopState = () => {
      onClose(); // close modal instead of navigating
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [open]);

  useEffect(() => {
    if (data) {
      setDetails(data);
      return;
    }

    if (id) {
      fetchDetails();
    }
  }, [id, data, refreshKey]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await getSlotDetails(id);
      setDetails(res);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setDetails(null);
    onClose();
  };

  const handleEdit = () => [onEdit(slot)];
  const handleDelete = () => [onDelete(slot.id)];

  const handleMarkAttended = async () => {
    try {
      await markSlotAttended(slot.id);
      setDetails((prev) => ({
        ...prev,
        slot: { ...prev.slot, attended: true },
      }));
    } catch (err) {
      alert(err || "Failed to mark attendance");
    }
  };

  const handleCopy = (value, field) => {
    navigator.clipboard.writeText(value);
    // navigator.clipboard.writeText(value);
    setCopiedField(field);

    setTimeout(() => {
      setCopiedField(null);
    }, 1500);
  };

  if (!details) return null;

  const { slot, payment, user, admin } = details;
  const slotAttendedStatus = getSlotAttendedStatus(
    slot.date,
    slot.start_time,
    slot.end_time,
  );
  const attendanceCheck = getAttendanceEligibility(slot);
  const displayStatus = getDisplayStatus(slot, slotAttendedStatus);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-3xl rounded-2xl shadow-xl overflow-y-auto max-h-[90vh]">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Booking Details</h2>
          <button onClick={handleClose}>
            <X />
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : (
          <div className="p-6 space-y-8">
            {/* ACTION BUTTONS */}
            <section className="flex flex-col gap-4">
              <div className="relative w-full flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    if (!attendanceCheck.allowed) {
                      return;
                    }

                    handleMarkAttended();
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    attendanceCheck.allowed
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {slot.attended ? "Attended" : "Mark as Attended"}
                </button>
                {!attendanceCheck.allowed && (
                  <p className="text-xs text-gray-400 mt-1 text-left top-full">
                    {attendanceCheck.reason}
                  </p>
                )}
              </div>
              {slot.created_by_type === "admin" && (
                <div className="flex gap-2">
                  <button
                    className="bg-yellow-600 px-3 py-1 rounded-lg"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-red-600 px-3 py-1 rounded-lg"
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              )}
            </section>

            {/* SLOT DETAILS */}
            <section className="flex flex-col items-start">
              <div className="w-full flex items-center justify-between mb-3">
                <h3 className="text-green-400 font-semibold ">
                  Slot Information
                </h3>
                {displayStatus && (
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      displayStatus === "ATTENDED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : displayStatus === "NOT ATTENDED"
                          ? "bg-red-500/20 text-red-400"
                          : displayStatus === "UPCOMING"
                            ? "bg-blue-500/20 text-blue-400"
                            : displayStatus?.startsWith("In")
                              ? "bg-amber-500/20 text-amber-400"
                              : displayStatus === "ONGOING"
                                ? "bg-green-500/20 text-green-400"
                                : displayStatus === "COMPLETED"
                                  ? "bg-gray-600/30 text-gray-300"
                                  : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {displayStatus}
                  </span>
                )}
              </div>

              <div className="w-full grid grid-cols-2 gap-4 text-sm text-start">
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="text-white">{formatDate(slot.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Time</p>
                  <p className="text-white">
                    {minutesToTime(slot.start_time)} -{" "}
                    {minutesToTime(slot.end_time)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Sport</p>
                  <p className="text-white">{slot.sport}</p>
                </div>
                <div>
                  <p className="text-gray-500">Box</p>
                  <p className="text-white">{slot.box}</p>
                </div>
                <div>
                  <p className="text-gray-500">Game Pass Code</p>
                  <p className="text-white">{slot.game_pass_code}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="text-white">{slot.status}</p>
                </div>
                <div>
                  <p className="text-gray-500">Note</p>
                  <p className="text-white">{slot.note ? slot.note : "-"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Attended?</p>
                  <p className="text-white">{slot.attended ? "Yes" : "No"}</p>
                </div>
                {slot.rescheduled_from_id && (
                  <div>
                    <p className="text-gray-500">Reschudeled from</p>
                    <p className="text-white">Rescheduled from another slot.</p>
                  </div>
                )}
              </div>
            </section>

            {/* PAYMENT DETAILS */}
            <section className="flex flex-col items-start">
              <h3 className="text-green-400 font-semibold mb-3">
                Payment Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm text-left">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="text-white">
                    ₹ {payment.amount || slot.total_amount}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="text-white">{payment.status}</p>
                </div>

                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="text-white">{payment.order_id}</p>
                </div>

                {payment.failure_reason && (
                  <div className="md:col-span-2">
                    <p className="text-gray-500">Failure Reason</p>
                    <p className="text-red-400">{payment.failure_reason}</p>
                  </div>
                )}
              </div>
            </section>

            {/* USER DETAILS */}
            <section className="flex flex-col items-start">
              <h3 className="text-green-400 font-semibold mb-3">
                {slot.created_by_type === "admin"
                  ? "Admin Details"
                  : "User Details"}
              </h3>
              {slot.created_by_type === "user" ? (
                <>
                  <div className="flex items-start gap-4">
                    {user.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt="avatar"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}

                    <div className="text-left">
                      <p className="text-white font-medium text-lg my-2">
                        {user.name}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 my-2">
                    <div className="flex gap-2 text-left items-center justify-between px-3">
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm text-white">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(user.email, "email")}
                        className="text-gray-400 hover:text-white transition"
                      >
                        {copiedField === "email" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>

                    <div className="flex gap-2 text-left items-center justify-between px-3">
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm text-white">{user.phone_no}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(user.phone_no, "phone")}
                        className="text-gray-400 hover:text-white transition"
                      >
                        {copiedField === "phone" ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p>{`Created by ${admin.username}`}</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlotDetailsModal;
