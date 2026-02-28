import React, { useContext, useState } from "react";
import { deleteSport, saveSport, updateSport } from "../../api/sportService";
import { AvailableSportsContext } from "../../util/availableSportsContext";
import { Edit, Trash2, Plus, Save, X } from "lucide-react";
import OffersList from "./OffersList";
import ChargesList from "./ChargeList";

function Prices() {
  const [loading, setLoading] = useState(false);
  const { availableSports, updateAvailableSports } = useContext(
    AvailableSportsContext,
  );

  const [addingRow, setAddingRow] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [newSport, setNewSport] = useState({
    sport: "",
    box: "Box-1",
    cost: "",
    evening_cost: 0,
    weekend_cost: 0,
  });
  const [editSport, setEditSport] = useState({
    id: "",
    cost: "",
    evening_cost: 0,
    weekend_cost: 0,
    sport: "",
    box: "Box-1",
  });

  const handleAddSport = async () => {
    if (!newSport.sport || !newSport.cost) {
      alert("Please fill in both Sport and cost");
      return;
    }
    setLoading(true);
    try {
      let res = await saveSport(newSport);
      updateAvailableSports((prev) => [...prev, res]);
      setNewSport({
        sport: "",
        cost: "",
        evening_cost: 0,
        weekend_cost: 0,
      });
      setAddingRow(false);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleDeleteSport = async (id) => {
    if (!window.confirm("Delete this sport?")) {
      return;
    }
    setLoading(true);
    try {
      await deleteSport(id);
      updateAvailableSports((prev) => prev.filter((sport) => sport.id !== id));
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleEditSport = (idx) => {
    setEditingRow(idx);
    setEditSport(availableSports[idx]);
  };

  const handleSaveEdit = async () => {
    if (!editSport.sport || !editSport.cost) {
      alert("Please fill in both Sport and cost");
      return;
    }

    setLoading(true);
    try {
      await updateSport(editSport);
      //   setSportsArray((prev) => {
      //     prev[editingRow] = editSport;
      //     return prev;
      //   });
      updateAvailableSports((existing) => {
        const updated = existing.map((s) =>
          s.id === editSport.id ? editSport : s,
        );
        return updated;
      });
      setEditingRow(null);
      setEditSport({
        id: "",
        cost: "",
        evening_cost: 0,
        weekend_cost: 0,
        sport: "",
      });
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="relative py-6 max-w-3xl mx-auto">
        {loading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="text-white text-lg font-semibold">Loading...</div>
          </div>
        )}
        <div className="mt-8">
          <h3 className="text-start text-lg font-semibold mb-3">
            Sport Details
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-700 rounded-md">
              <thead className="bg-gray-800 text-gray-200">
                <tr>
                  <th className="p-2 text-left">Sport</th>
                  <th className="p-2 text-left">Box</th>
                  <th className="p-2 text-end">Cost</th>
                  <th className="p-2 text-end">Evening Cost</th>
                  <th className="p-2 text-end">Weekend Cost</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {availableSports.map((s, idx) => (
                  <tr key={idx} className="border-t border-gray-700">
                    <td className="p-2 text-start">
                      {editingRow === idx ? (
                        <input
                          type="text"
                          value={editSport.sport}
                          onChange={(e) =>
                            setEditSport({
                              ...editSport,
                              sport: e.target.value,
                            })
                          }
                          className="bg-gray-800 border rounded-md p-2 w-full"
                        />
                      ) : (
                        s.sport
                      )}
                    </td>
                    <td className="p-2 text-start w-24">
                      {editingRow === idx ? (
                        <select
                          type="text"
                          value={editSport.box}
                          onChange={(e) =>
                            setEditSport({ ...editSport, box: e.target.value })
                          }
                          className="bg-gray-800 border rounded-md py-2 px-0.5 w-full"
                        >
                          <option value={"Box-1"}>Box-1</option>
                          <option value={"Box-2"}>Box-2</option>
                        </select>
                      ) : (
                        s.box
                      )}
                    </td>
                    <td className="p-2 text-end">
                      {editingRow === idx ? (
                        <input
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          value={editSport.cost}
                          onChange={(e) =>
                            setEditSport({ ...editSport, cost: e.target.value })
                          }
                          className="input p-1 text-right"
                        />
                      ) : (
                        s.cost
                      )}
                    </td>
                    <td className="p-2 text-end">
                      {editingRow === idx ? (
                        <input
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          value={editSport.evening_cost}
                          onChange={(e) =>
                            setEditSport({
                              ...editSport,
                              evening_cost: e.target.value,
                            })
                          }
                          className="input p-1 text-right"
                        />
                      ) : (
                        s.evening_cost
                      )}
                    </td>
                    <td className="p-2 text-end">
                      {editingRow === idx ? (
                        <input
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          value={editSport.weekend_cost}
                          onChange={(e) =>
                            setEditSport({
                              ...editSport,
                              weekend_cost: e.target.value,
                            })
                          }
                          className="input p-1 text-right"
                        />
                      ) : (
                        s.weekend_cost
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
                            onClick={() => {
                              setEditingRow(null);
                              setEditSport({});
                            }}
                            className="text-gray-400 cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditSport(idx)}
                            className="text-blue-400 cursor-pointer"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteSport(s.id)}
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
                        value={newSport.sport}
                        onChange={(e) =>
                          setNewSport((v) => ({ ...v, sport: e.target.value }))
                        }
                        className="bg-gray-800 border rounded-md p-2 w-full"
                        placeholder="Sport"
                      />
                    </td>
                    <td className="p-2 text-start w-24">
                      <select
                        type="text"
                        value={newSport.box}
                        onChange={(e) =>
                          setNewSport((v) => ({ ...v, box: e.target.value }))
                        }
                        className="bg-gray-800 border rounded-md py-2 px-0.5 w-full"
                      >
                        <option value={"Box-1"}>Box-1</option>
                        <option value={"Box-2"}>Box-2</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={newSport.cost}
                        onChange={(e) =>
                          setNewSport((v) => ({ ...v, cost: e.target.value }))
                        }
                        className="input p-1"
                        placeholder="Cost"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={newSport.evening_cost}
                        onChange={(e) =>
                          setNewSport((v) => ({
                            ...v,
                            evening_cost: e.target.value,
                          }))
                        }
                        className="input p-1"
                        placeholder="Cost"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        value={newSport.weekend_cost}
                        onChange={(e) =>
                          setNewSport((v) => ({
                            ...v,
                            weekend_cost: e.target.value,
                          }))
                        }
                        className="input p-1"
                        placeholder="Cost"
                      />
                    </td>
                    <td className="p-2 flex justify-center">
                      <button
                        onClick={handleAddSport}
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
              <Plus size={18} /> Add Sport
            </button>
          )}
        </div>
      </div>
      <OffersList />
      <ChargesList />
    </div>
  );
}

export default Prices;
