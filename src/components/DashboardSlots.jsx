// DashboardSlots.jsx
import React, { useState, useEffect, useContext } from "react";
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { getSlots, deleteSlot, saveSlot } from "../api/slotService";
import SlotModal from "./SlotModal";
import { minutesToTime } from "../util/utils";
import { AvailableSportsContext } from "../util/availableSportsContext";

const DashboardSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [filters, setFilters] = useState({
    all: false,
    only_blocked: true,
    current_time: 360,
    date: new Date().toISOString().split("T")[0],
  });
  const { availableSports } = useContext(AvailableSportsContext);

  const fetchSlots = async (noCache = false) => {
    setLoading(true);
    try {
      const res = await getSlots(filters, noCache);
      setSlots(res);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    setLoading(true);
    try {
      await deleteSlot(id);
      await fetchSlots(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSave = async (formData) => {
    setLoading(true);
    try {
      await saveSlot(formData, editSlot);
      setShowModal(false);
      setEditSlot(null);
      await fetchSlots(true);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 w-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="loader" />
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

      {/* Filters */}
      <div className="flex flex-col flex-wrap items-start gap-4 mb-4">
        <div className="flex items-start md:items-center gap-3 md:gap-8 md:flex-row flex-col">
          <div className="md:mr-4">
            <label className="mr-2">Show Slots:</label>
            <label>
              <input
                type="radio"
                checked={filters.all}
                onChange={() => setFilters({ ...filters, all: true })}
                className="mr-1"
              />
              All
            </label>
            <label className="ml-2">
              <input
                type="radio"
                checked={!filters.all}
                onChange={() => setFilters({ ...filters, all: false })}
                className="mr-1"
              />
              Current & Future
            </label>
          </div>
          <label className="md:mr-4">
            <input
              type="checkbox"
              checked={filters.onlyBlocked}
              onChange={(e) =>
                setFilters({ ...filters, only_blocked: e.target.checked })
              }
              className="mr-2"
            />
            Only Booked Slots
          </label>
          <div>
            <label className="mr-2">From Date:</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="bg-[#777777] rounded-sm px-2"
            />
          </div>
        </div>
        <button
          onClick={fetchSlots}
          className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded hover:bg-green-600"
        >
          <RefreshCw size={16} /> Fetch / Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-green-500 text-white">
            <tr>
              {[
                "S.no",
                "Date",
                "Start",
                "End",
                "Blocked",
                "Note",
                "Sport",
                "Actions",
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
                <tr key={s.id} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{s.date}</td>
                  <td className="p-2">{minutesToTime(s.start_time)}</td>
                  <td className="p-2">{minutesToTime(s.end_time)}</td>
                  <td className="p-2">{s.blocked ? "Yes" : "No"}</td>
                  <td className="p-2">{s.note || "-"}</td>
                  <td className="p-2">{s.sport || "-"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => {
                        s.sportId = availableSports.find(
                          (sport) => sport.name == s.sport
                        )?.id;
                        setEditSlot(s);
                        setShowModal(true);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(s.id)}>
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default DashboardSlots;
