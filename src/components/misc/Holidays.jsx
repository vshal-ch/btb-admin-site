import React, { useState } from "react";
import {
  //   getHolidays,
  saveHoliday,
  updateHoliday,
  deleteHoliday,
} from "../../api/holidaysService";

import { Edit, Trash2, Plus, Save, X } from "lucide-react";

function toDateOnly(date) {
  if (!date) return "";

  // If already in YYYY-MM-DD, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;

  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Holidays({ holidaysData }) {
  const [holidays, setHolidays] = useState(holidaysData);
  const [loading, setLoading] = useState(false);

  const [addingRow, setAddingRow] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [newHoliday, setNewHoliday] = useState({
    date: "",
    name: "",
    type: "public",
  });

  const [editHoliday, setEditHoliday] = useState({});

  //   // 🔄 Load holidays
  //   const load = async () => {
  //     setLoading(true);
  //     try {
  //       const res = await getHolidays();
  //       setHolidays(res);
  //     } catch (err) {
  //       alert(err);
  //     }
  //     setLoading(false);
  //   };

  //   useEffect(() => {
  //     load();
  //   }, []);

  const handleAdd = async () => {
    if (!newHoliday.date || !newHoliday.name) {
      alert("Date and name required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...newHoliday,
        date: toDateOnly(newHoliday.date),
      };
      const res = await saveHoliday(payload);
      setHolidays((prev) => [...prev, res]);

      setNewHoliday({
        date: "",
        name: "",
        type: "public",
      });

      setAddingRow(false);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;

    setLoading(true);
    try {
      await deleteHoliday(id);
      setHolidays((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleEdit = (idx) => {
    setEditingRow(idx);
    setEditHoliday(holidays[idx]);
  };

  const handleSaveEdit = async () => {
    if (!editHoliday.date || !editHoliday.name) {
      alert("Date and name required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...editHoliday,
        date: toDateOnly(editHoliday.date),
      };
      await updateHoliday(payload);

      setHolidays((prev) =>
        prev.map((h) => (h.id === editHoliday.id ? payload : h)),
      );

      setEditingRow(null);
      setEditHoliday({});
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  return (
    <div className="relative py-6 max-w-4xl mx-auto">
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg font-semibold">Loading...</div>
        </div>
      )}

      <h3 className="text-lg font-semibold mb-3">Holidays</h3>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 rounded-md">
          <thead className="bg-gray-800 text-gray-200">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {holidays.map((h, idx) => (
              <tr key={h.id} className="border-t border-gray-700 text-start">
                {/* Date */}
                <td className="p-2">
                  {editingRow === idx ? (
                    <input
                      type="date"
                      value={editHoliday.date}
                      onChange={(e) =>
                        setEditHoliday({ ...editHoliday, date: e.target.value })
                      }
                      className="bg-gray-800 border rounded-md p-2 w-full"
                    />
                  ) : (
                    h.date
                  )}
                </td>

                {/* Name */}
                <td className="p-2">
                  {editingRow === idx ? (
                    <input
                      value={editHoliday.name}
                      onChange={(e) =>
                        setEditHoliday({ ...editHoliday, name: e.target.value })
                      }
                      className="bg-gray-800 border rounded-md p-2 w-full"
                    />
                  ) : (
                    h.name
                  )}
                </td>

                {/* Type */}
                <td className="p-2">
                  {editingRow === idx ? (
                    <select
                      value={editHoliday.type}
                      onChange={(e) =>
                        setEditHoliday({ ...editHoliday, type: e.target.value })
                      }
                      className="bg-gray-800 border rounded-md p-2"
                    >
                      <option value="public">Public</option>
                      <option value="regional">Regional</option>
                      <option value="custom">Custom</option>
                    </select>
                  ) : (
                    h.type
                  )}
                </td>
                {/* Actions */}
                <td className="p-2 flex justify-center gap-2">
                  {editingRow === idx ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-400"
                      >
                        <Save size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingRow(null);
                          setEditHoliday({});
                        }}
                        className="text-gray-400"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(idx)}
                        className="text-blue-400"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="text-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {addingRow && (
              <tr className="border-t border-gray-700 bg-gray-900">
                <td className="p-2">
                  <input
                    type="date"
                    value={newHoliday.date}
                    onChange={(e) =>
                      setNewHoliday((v) => ({ ...v, date: e.target.value }))
                    }
                    className="bg-gray-800 border rounded-md p-2 w-full"
                  />
                </td>

                <td className="p-2">
                  <input
                    value={newHoliday.name}
                    onChange={(e) =>
                      setNewHoliday((v) => ({ ...v, name: e.target.value }))
                    }
                    className="bg-gray-800 border rounded-md p-2 w-full"
                  />
                </td>

                <td className="p-2">
                  <select
                    value={newHoliday.type}
                    onChange={(e) =>
                      setNewHoliday((v) => ({ ...v, type: e.target.value }))
                    }
                    className="bg-gray-800 border rounded-md p-2"
                  >
                    <option value="public">Public</option>
                    <option value="regional">Regional</option>
                    <option value="custom">Custom</option>
                  </select>
                </td>

                <td className="p-2 flex justify-center gap-2">
                  <button onClick={handleAdd} className="text-green-400">
                    <Save size={18} />
                  </button>
                  <button
                    onClick={() => setAddingRow(false)}
                    className="text-gray-400"
                  >
                    <X size={18} />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!addingRow && (
        <button
          onClick={() => setAddingRow(true)}
          className="mt-3 flex items-center gap-2 bg-[#00a700] text-[#e0e0e0] px-3 py-2 rounded-md font-medium hover:scale-105 transition"
        >
          <Plus size={18} /> Add Holiday
        </button>
      )}
    </div>
  );
}

export default Holidays;
