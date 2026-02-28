import React, { useState } from "react";
// import { AvailableSportsContext } from "../util/availableSportsContext";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import {
  deleteAmenity,
  saveAmenity,
  updateAmenity,
} from "../../api/amenityService";

function Amenities({ amenitiesData }) {
  console.log(amenitiesData);

  const [amenities, setAmenities] = useState(amenitiesData);
  // Local states
  const [editingId, setEditingId] = useState(null);
  const [editingAmenity, setEditingAmenity] = useState("");
  const [newAmenity, setNewAmenity] = useState("");

  const handleAddAmenity = async () => {
    if (!newAmenity.trim()) return;

    try {
      const resp = await saveAmenity(newAmenity);
      setAmenities([...amenities, resp]);
      setNewAmenity("");
    } catch (e) {
      alert(e);
    }
  };

  const handleEdit = (amenity) => {
    setEditingId(amenity.id);
    setEditingAmenity(amenity.amenity);
  };

  const handleSave = async (id) => {
    if (!editingAmenity.trim()) return;

    try {
      await updateAmenity({ id: id, amenity: editingAmenity });

      const updated = amenities.map((s) =>
        s.id === id ? { ...s, amenity: editingAmenity } : s,
      );
      setAmenities(updated);
      setEditingId(null);
      setEditingAmenity("");
    } catch (e) {
      alert(e);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingAmenity("");
  };

  const handleDelete = async (id) => {
    try {
      await deleteAmenity(id);
      const filtered = amenities.filter((s) => s.id !== id);
      setAmenities(filtered);
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div className="flex flex-col items-start text-left mt-4">
      {/* Add new amenity */}
      <div className="flex items-center gap-2 mb-3">
        <input
          type="text"
          placeholder="Add new amenity"
          className="border px-2 py-1 rounded"
          value={newAmenity}
          onChange={(e) => setNewAmenity(e.target.value)}
        />
        <button
          onClick={handleAddAmenity}
          className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <ul className="space-y-2">
        {amenities.map((amenity) => (
          <li key={amenity.id} className="flex items-center gap-3">
            {editingId === amenity.id ? (
              <>
                <input
                  className="border px-2 py-1 rounded"
                  value={editingAmenity}
                  onChange={(e) => setEditingAmenity(e.target.value)}
                />
                <button
                  onClick={() => handleSave(amenity.id)}
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
                <span>{amenity.amenity}</span>
                <button
                  onClick={() => handleEdit(amenity)}
                  className="text-blue-600"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(amenity.id)}
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

export default Amenities;
