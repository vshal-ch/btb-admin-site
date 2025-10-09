import { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import {
  deleteCost,
  editCost,
  getVenue,
  saveCost,
  saveVenue,
} from "../api/venueService";

export default function VenueDetails() {
  const [venue, setVenue] = useState({
    name: "",
    is_open: "open",
    timings: "",
    address: "",
    gmaps_url: "",
    dimensions: "",
  });
  const [originalVenue, setOriginalVenue] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [costsArray, setCostsArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingRow, setAddingRow] = useState(false);
  const [newCost, setNewCost] = useState({ timings: "", cost: "" });
  const [editingRow, setEditingRow] = useState(null);

  // ✅ Fetch venue details on mount
  useEffect(() => {
    fetchVenue();
  }, []);

  const fetchVenue = async () => {
    setLoading(true);
    try {
      const venueData = await getVenue();
      const formattedVenue = {
        name: venueData.name || "",
        is_open: venueData.is_open ? "open" : "closed",
        timings: venueData.timings || "",
        address: venueData.address || "",
        gmaps_url: venueData.gmaps_url || "",
        dimensions: venueData.dimensions || "",
      };

      setVenue(formattedVenue);
      setOriginalVenue(formattedVenue);
      setCostsArray(venueData.costs || []);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!originalVenue) return;
    const modified = Object.keys(originalVenue).some(
      (key) => venue[key] !== originalVenue[key]
    );
    setIsModified(modified);
  }, [venue, originalVenue]);

  const handleAddCost = async () => {
    if (!newCost.timings || !newCost.cost) {
      alert("Please fill in both timings and cost");
      return;
    }
    setLoading(true);
    try {
      let res = await saveCost(newCost);
      setCostsArray((prev) => [...prev, { ...res }]);
      setNewCost({ timings: "", cost: "" });
      setAddingRow(false);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleDeleteCost = async (idx) => {
    if (!window.confirm("Delete this cost detail?")) {
      return;
    }
    setLoading(true);
    try {
      await deleteCost(costsArray[idx]);
      setCostsArray((prev) => prev.filter((_, i) => i !== idx));
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleEditCost = (idx) => {
    setEditingRow(idx);
  };

  const handleSaveEdit = async (idx) => {
    const cost = costsArray[idx];
    if (!cost.timings || !cost.cost) {
      alert("Please fill in both timings and cost");
      return;
    }
    setLoading(true);
    try {
      await editCost(cost);
      setEditingRow(null);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleSaveVenue = async () => {
    // TODO: add save API call logic here
    setLoading(true);
    try {
      await saveVenue({
        ...venue,
        is_open: venue.is_open === "open" ? true : false,
      });
      setOriginalVenue(venue);
      setIsModified(false);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  return (
    <div className="relative py-6 max-w-3xl mx-auto">
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg font-semibold">Loading...</div>
        </div>
      )}

      <div className="w-full flex flex-row justify-between mb-4 items-center">
        <h2 className="text-2xl font-semibold">Venue Details</h2>
        <button
          onClick={handleSaveVenue}
          disabled={!isModified}
          className={`px-4 py-1 rounded-md text-white cursor-pointer bg-[#00b140] ${
            isModified ? "block" : "hidden"
          }`}
        >
          Save
        </button>
      </div>

      {/* Venue info form */}
      <div className="grid gap-4">
        <Field label="Venue Name">
          <input
            type="text"
            value={venue?.name ?? ""}
            onChange={(e) => setVenue((v) => ({ ...v, name: e.target.value }))}
            className="input"
          />
        </Field>

        <Field label="Venue Status">
          <select
            value={venue.is_open}
            onChange={(e) =>
              setVenue((v) => ({ ...v, is_open: e.target.value }))
            }
            className="input"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </Field>

        <Field label="Venue Timings">
          <input
            type="text"
            value={venue.timings}
            onChange={(e) =>
              setVenue((v) => ({ ...v, timings: e.target.value }))
            }
            className="input"
          />
        </Field>

        <Field label="Address">
          <textarea
            value={venue.address}
            onChange={(e) =>
              setVenue((v) => ({ ...v, address: e.target.value }))
            }
            className="input h-20"
          />
        </Field>

        <Field label="Gmaps URL">
          <input
            type="url"
            value={venue.gmaps_url}
            onChange={(e) =>
              setVenue((v) => ({ ...v, gmaps_url: e.target.value }))
            }
            className="input"
          />
        </Field>

        <Field label="Dimensions">
          <input
            type="text"
            value={venue.dimensions}
            onChange={(e) =>
              setVenue((v) => ({ ...v, dimensions: e.target.value }))
            }
            className="input"
          />
        </Field>
      </div>

      {/* Cost Details Table */}
      <div className="mt-8">
        <h3 className="text-start text-lg font-semibold mb-3">Cost Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 rounded-md">
            <thead className="bg-gray-800 text-gray-200">
              <tr>
                <th className="p-2 text-left">Timings</th>
                <th className="p-2 text-end">Cost</th>
                <th className="p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {costsArray.map((c, idx) => (
                <tr key={idx} className="border-t border-gray-700">
                  <td className="p-2 text-start">
                    {editingRow === idx ? (
                      <input
                        type="text"
                        value={c.timings}
                        onChange={(e) =>
                          setCostsArray((cArray) => {
                            const updated = [...cArray];
                            updated[idx].timings = e.target.value;
                            return updated;
                          })
                        }
                        className="input p-1"
                      />
                    ) : (
                      c.timings
                    )}
                  </td>
                  <td className="p-2 text-end">
                    {editingRow === idx ? (
                      <input
                        type="number"
                        value={c.cost}
                        onChange={(e) =>
                          setCostsArray((cArray) => {
                            const updated = [...cArray];
                            updated[idx].cost = e.target.value;
                            return updated;
                          })
                        }
                        className="input p-1"
                      />
                    ) : (
                      c.cost
                    )}
                  </td>
                  <td className="p-2 flex justify-center gap-2">
                    {editingRow === idx ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="text-green-400 cursor-pointer"
                        >
                          <Save size={18} />
                        </button>
                        <button
                          onClick={() => setEditingRow(null)}
                          className="text-gray-400 cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditCost(idx)}
                          className="text-blue-400 cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCost(idx)}
                          className="text-red-400 cursor-pointer"
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
                      type="text"
                      value={newCost.timings}
                      onChange={(e) =>
                        setNewCost((v) => ({ ...v, timings: e.target.value }))
                      }
                      className="input p-1"
                      placeholder="Timings"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={newCost.cost}
                      onChange={(e) =>
                        setNewCost((v) => ({ ...v, cost: e.target.value }))
                      }
                      className="input p-1"
                      placeholder="Cost"
                    />
                  </td>
                  <td className="p-2 flex justify-center">
                    <button
                      onClick={handleAddCost}
                      className="text-green-400 mr-2"
                    >
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
            <Plus size={18} /> Add Cost Detail
          </button>
        )}
      </div>
    </div>
  );
}

// Helper Field component
function Field({ label, children }) {
  return (
    <div>
      <label className="text-start block text-sm text-gray-400 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
