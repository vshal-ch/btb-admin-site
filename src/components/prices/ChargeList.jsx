// OffersList.jsx
import React, { useEffect, useState } from "react";
import { ChevronDown, Edit, Trash2, Plus } from "lucide-react";
import ChargeModal from "./ChargeModal";
import { getCharges, deleteCharge } from "../../api/chargeService";

const ChargesList = () => {
  const [charges, setCharges] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);

  const fetchCharges = async () => {
    const res = await getCharges();
    setCharges(res || []);
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const toggleExpand = async (chargeId) => {
    if (expanded === chargeId) {
      setExpanded(null);
      return;
    }

    setExpanded(chargeId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this charge?")) return;
    await deleteCharge(id);
    fetchCharges();
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-cente mb-4">
        <h1 className="text-2xl font-semibold text-green-500">Charges</h1>

        <button
          onClick={() => {
            setSelectedCharge(null);
            setModalOpen(true);
          }}
          className="bg-green-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add Charge
        </button>
      </div>
      {/* Charge list  */}
      <div className="w-full flex justify-between items-center px-4 text-sm mb-0.5">
        <p>Charge title</p>
        <p className="mr-10">Status</p>
      </div>
      {charges.map((charge, idx) => (
        <div
          key={charge.id}
          className={`bg-gray-900 border border-gray-800
           ${idx == 0 ? "rounded-t-xl" : ""} ${idx == charges.length - 1 ? "rounded-b-xl" : ""} overflow-hidden`}
        >
          {/* Header */}
          <div
            onClick={() => toggleExpand(charge.id)}
            className="flex justify-between items-center px-4 py-4 cursor-pointer hover:bg-gray-800"
          >
            <div className="flex items-center gap-4 ">
              <div className="font-medium text-white">{charge.title}</div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  charge.is_active
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-600/30 text-gray-300"
                }`}
              >
                {charge.is_active ? "ACTIVE" : "INACTIVE"}
              </span>

              <ChevronDown
                size={18}
                className={`transition-transform ${
                  expanded === charge.id ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {/* Expanded */}
          {expanded === charge.id && (
            <div className="grid grid-cols-2 text-left justify-start items-start p-4 border-t border-gray-800 space-y-4 text-sm">
              <div className="col-span-2 ">
                <strong>Active:</strong>{" "}
                {new Date(charge.active_from).toDateString()} →{" "}
                {new Date(charge.active_until).toDateString()}
              </div>

              <div>
                <strong>Charge type:</strong> {charge.charge_type}
              </div>

              <div>
                <strong>Charge value:</strong> {charge.charge_value}
              </div>
              <div>
                <strong>Apply on:</strong> {charge.apply_on}
              </div>
              <div>
                <strong>Priority:</strong> {charge.priority}
              </div>
              {/* Actions */}
              <div className="flex justify-end gap-4 pt-2">
                <button
                  onClick={() => {
                    setSelectedCharge(charge);
                    setModalOpen(true);
                  }}
                  className="text-green-400"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => handleDelete(charge.id)}
                  className="text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {modalOpen && (
        <ChargeModal
          charge={selectedCharge}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchCharges();
          }}
        />
      )}
    </div>
  );
};

export default ChargesList;
