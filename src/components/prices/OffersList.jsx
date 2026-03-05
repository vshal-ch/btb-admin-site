// OffersList.jsx
import React, { useEffect, useState } from "react";
import { ChevronDown, Edit, Trash2, Plus } from "lucide-react";
import OfferModal from "./OfferModal";
import { getOffers, deleteOffer } from "../../api/offerService";

function getOfferStatus(offer) {
  if (!offer.is_active) {
    return "INACTIVE";
  }
  const now = new Date();

  const offerFromDate = new Date(offer.active_from);

  const offerUntilDate = new Date(offer.active_until);

  if (now < offerFromDate) {
    return "FUTURE";
  }

  if (now > offerUntilDate) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const fetchOffers = async () => {
    const res = await getOffers();
    setOffers(res || []);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const toggleExpand = async (offerId) => {
    if (expanded === offerId) {
      setExpanded(null);
      return;
    }

    setExpanded(offerId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    await deleteOffer(id);
    fetchOffers();
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-cente mb-4">
        <h1 className="text-2xl font-semibold text-green-500">Offers</h1>

        <button
          onClick={() => {
            setSelectedOffer(null);
            setModalOpen(true);
          }}
          className="bg-green-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} /> Add Offer
        </button>
      </div>
      {/* Offer list  */}
      <div className="w-full flex justify-between items-center px-4 text-sm mb-0.5">
        <p>Offer title</p>
        <p className="mr-10">Status</p>
      </div>
      {offers.map((offer, idx) => {
        const offerStatus = getOfferStatus(offer);
        return (
          <div
            key={offer.id}
            className={`bg-gray-900 border border-gray-800
           ${idx == 0 ? "rounded-t-xl" : ""} ${idx == offers.length - 1 ? "rounded-b-xl" : ""} overflow-hidden`}
          >
            {/* Header */}
            <div
              onClick={() => toggleExpand(offer.id)}
              className="flex justify-between items-center px-4 py-4 cursor-pointer hover:bg-gray-800"
            >
              <div className="flex items-center gap-4 ">
                <div className="font-medium text-white">{offer.title}</div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    offerStatus === "ACTIVE"
                      ? "bg-green-500/20 text-green-400"
                      : offerStatus === "FUTURE"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-gray-600/30 text-gray-300"
                  }`}
                >
                  {offerStatus}
                </span>

                <ChevronDown
                  size={18}
                  className={`transition-transform ${
                    expanded === offer.id ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>

            {/* Expanded */}
            {expanded === offer.id && (
              <div className="grid grid-cols-2 text-left justify-start items-start p-4 border-t border-gray-800 space-y-4 text-sm">
                <div className="col-span-2 ">
                  <strong>Active:</strong>{" "}
                  {new Date(offer.active_from).toDateString()} →{" "}
                  {new Date(offer.active_until).toDateString()}
                </div>

                <div className="col-span-2">
                  <strong>Description:</strong> {offer.description || "-"}
                </div>

                <div>
                  <strong>Discount type:</strong> {offer.discount_type}
                </div>

                <div>
                  <strong>Discount value:</strong> {offer.discount_value}
                </div>
                <div>
                  <strong>Max discount amount:</strong>
                  {offer.max_discount_amount || " Not set"}
                </div>
                <div>
                  <strong>Apply on:</strong> {offer.apply_on}
                </div>
                <div>
                  <strong>Priority:</strong> {offer.priority}
                </div>

                <div>
                  <strong>Stackable:</strong>{" "}
                  {offer.is_stackable ? "Yes" : "No"}
                </div>

                {/* Conditions */}
                <div className="col-span-2">
                  <strong>Conditions:</strong>

                  {offer.conditions?.length ? (
                    <ul className="mt-2 space-y-1">
                      {offer.conditions.map((cond) => (
                        <li
                          key={cond.id}
                          className="bg-gray-800 px-3 py-2 rounded"
                        >
                          {cond.condition_type} {cond.operator} {cond.value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 mt-2">No conditions</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-2">
                  <button
                    onClick={() => {
                      setSelectedOffer(offer);
                      setModalOpen(true);
                    }}
                    className="text-green-400"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {modalOpen && (
        <OfferModal
          offer={selectedOffer}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchOffers();
          }}
        />
      )}
    </div>
  );
};

export default OffersList;
