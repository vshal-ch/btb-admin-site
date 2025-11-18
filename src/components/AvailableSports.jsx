import React, { useContext, useState } from "react";
import { AvailableSportsContext } from "../util/availableSportsContext";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import { deleteSport, saveSport, updateSport } from "../api/sportService";

function AvailableSports() {
  const { availableSports, updateAvailableSports } = useContext(
    AvailableSportsContext
  );

  // Local states
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [newSportName, setNewSportName] = useState("");

  const handleAddSport = async () => {
    if (!newSportName.trim()) return;

    try {
      const newSport = await saveSport(newSportName);
      updateAvailableSports([...availableSports, newSport]);
      setNewSportName("");
    } catch (e) {
      alert(e);
    }
  };

  const handleEdit = (sport) => {
    setEditingId(sport.id);
    setEditingName(sport.name);
  };

  const handleSave = async (id) => {
    if (!editingName.trim()) return;

    try {
      await updateSport({ id: id, name: editingName });

      const updated = availableSports.map((s) =>
        s.id === id ? { ...s, name: editingName } : s
      );
      updateAvailableSports(updated);
      setEditingId(null);
      setEditingName("");
    } catch (e) {
      alert(e);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (id) => {
    try {
      await deleteSport(id);
      const filtered = availableSports.filter((s) => s.id !== id);
      updateAvailableSports(filtered);
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div className="mt-8 flex flex-col items-start text-left">
      <h3 className="text-lg font-semibold mb-3">Available Sports</h3>

      {/* Add new sport */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Add new sport"
          className="border px-2 py-1 rounded"
          value={newSportName}
          onChange={(e) => setNewSportName(e.target.value)}
        />
        <button
          onClick={handleAddSport}
          className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <ul className="space-y-2">
        {availableSports.map((sport) => (
          <li key={sport.id} className="flex items-center gap-3">
            {editingId === sport.id ? (
              <>
                <input
                  className="border px-2 py-1 rounded"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button
                  onClick={() => handleSave(sport.id)}
                  className="text-green-600"
                >
                  <Save size={20} />
                </button>
                <button onClick={handleCancel} className="text-gray-500">
                  <X size={20} />
                </button>
              </>
            ) : (
              <>
                <span>{sport.name}</span>
                <button
                  onClick={() => handleEdit(sport)}
                  className="text-blue-600"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(sport.id)}
                  className="text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AvailableSports;
