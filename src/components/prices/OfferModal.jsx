import React, { useState, useEffect } from "react";
import { createOffer, updateOffer } from "../../api/offerService";

const OFFER_CONDITION_TYPES = [
  "MIN_DURATION",
  "SPORT",
  "DAY_OF_WEEK",
  "TIME_RANGE",
  "BOX",
];

const OFFER_CONDITION_OPERATORS = ["=", ">=", "<=", "IN"];

const OfferModal = ({ offer, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    discount_type: "PERCENT",
    discount_value: "",
    active_from: "",
    active_until: "",
    is_active: true,
    priority: undefined,
    is_stackable: false,
    apply_on: "RUNNING",
    max_discount_amount: "",
  });
  const [error, setError] = useState(null);

  const [conditions, setConditions] = useState([]);

  useEffect(() => {
    if (offer) {
      setForm({
        ...offer,
        active_from: offer.active_from ? offer.active_from.slice(0, 16) : "",
        active_until: offer.active_until ? offer.active_until.slice(0, 16) : "",
      });
      setConditions(offer.conditions || []);
    }
  }, [offer]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        id: "id-" + Date.now() + "-" + Math.random().toString(36).slice(2),
        condition_type: OFFER_CONDITION_TYPES[0],
        operator: "=",
        value: "",
      },
    ]);
  };

  const updateCondition = (index, key, value) => {
    const updated = [...conditions];
    updated[index][key] = value;
    setConditions(updated);
  };

  const removeCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Required fields
    if (!form.title?.trim()) {
      return "Title is required.";
    }

    if (!form.discount_type) {
      return "Discount type is required.";
    }

    if (!form.discount_value) {
      return "Discount value is required.";
    }

    if (!form.apply_on) {
      return "Apply on is required.";
    }

    if (!form.active_from || !form.active_until) {
      return "Active from and active until dates are required.";
    }

    if (form.priority === undefined || form.priority === "") {
      return "Priority is required.";
    }

    // Date validation
    const from = new Date(form.active_from);
    const until = new Date(form.active_until);

    if (isNaN(from) || isNaN(until)) {
      return "Invalid date format.";
    }

    if (from >= until) {
      return "Active until must be later than active from.";
    }

    if (until < new Date()) {
      return "Active until cannot be in the past.";
    }

    // Discount validations
    const discount = Number(form.discount_value);
    if (discount <= 0) {
      return "Discount value must be greater than 0.";
    }
    if (form.max_discount_amount) {
      const max_discount_amount = Number(form.max_discount_amount);
      if (max_discount_amount <= 0) {
        return "Discount value must be greater than 0.";
      }
    }

    if (form.discount_type === "PERCENT" && discount > 100) {
      return "Percentage discount cannot exceed 100%.";
    }

    // Priority validation
    if (Number(form.priority) < 0) {
      return "Priority must be 0 or greater.";
    }

    // Condition validation (important)
    for (let i = 0; i < conditions.length; i++) {
      const cond = conditions[i];

      if (!cond.condition_type || !cond.operator || !cond.value) {
        return `Condition ${i + 1} is incomplete.`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      setError(error);
      return;
    }
    setError("");
    try {
      if (offer?.id) {
        await updateOffer(offer.id, { ...form, conditions });
      } else {
        await createOffer({ ...form, conditions });
      }
      onSaved();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 ">
      <div className="bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-green-500">
            {offer ? "Edit Offer" : "Add Offer"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-8">
          {/* Offer Info */}
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Title (required)
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 resize-none"
              />
            </div>

            {/* Discount Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Discount Type (required)
                </label>
                <select
                  value={form.discount_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discount_type: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                >
                  <option value="PERCENT">Percentage</option>
                  <option value="FLAT">Fixed Amount</option>
                  <option value="FREE_DURATION">Free Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Discount Value (required)
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={form.discount_value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      discount_value: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Apply on (required)
                </label>
                <select
                  value={form.apply_on}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      apply_on: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                >
                  <option value="RUNNING">Running</option>
                  <option value="BASE">Base Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Maximum discount amount
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={form.max_discount_amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      max_discount_amount: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                />
              </div>
            </div>
            {/* Active Window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Active From (required)
                </label>
                <input
                  type="datetime-local"
                  value={form.active_from}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active_from: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Active Until (required)
                </label>
                <input
                  type="datetime-local"
                  value={form.active_until}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active_until: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Priority (required)
              </label>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
              <p className="mt-0.5 text-xs text-gray-400">
                Offer with least priority will be applied first.
              </p>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-6 pt-2">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_active: e.target.checked,
                    })
                  }
                />
                Is Active
              </label>

              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={form.is_stackable}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      is_stackable: e.target.checked,
                    })
                  }
                />
                Stackable{" "}
                <span className="text-xs text-gray-400">
                  (If checked, this offer will be applied with other stackable
                  offers.)
                </span>
              </label>
            </div>
          </div>

          {/* Conditions Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg text-gray-300">Offer Conditions</h3>
              <button onClick={addCondition} className="text-green-400 text-sm">
                + Add Condition
              </button>
            </div>

            {conditions.map((cond, index) => (
              <div
                key={cond.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 bg-gray-800 p-3 rounded"
              >
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Condition Type
                  </label>
                  <select
                    value={cond.condition_type}
                    onChange={(e) =>
                      updateCondition(index, "condition_type", e.target.value)
                    }
                    className="w-full bg-gray-900 p-2 rounded"
                  >
                    {OFFER_CONDITION_TYPES.map((t) => {
                      return <option value={t}>{t}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Operator
                  </label>
                  <select
                    value={cond.operator}
                    onChange={(e) =>
                      updateCondition(index, "operator", e.target.value)
                    }
                    className="w-full bg-gray-900 p-2 rounded"
                  >
                    {OFFER_CONDITION_OPERATORS.map((t) => {
                      return <option value={t}>{t}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Value (required)
                  </label>
                  <input
                    value={cond.value}
                    onChange={(e) =>
                      updateCondition(index, "value", e.target.value)
                    }
                    className="w-full bg-gray-900 p-2 rounded"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => removeCondition(index)}
                    className="text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t border-gray-800 flex items-center gap-4 ${error ? "justify-between" : "justify-end"}`}
        >
          {error && (
            <div className="bg-red-500/10 justify-self-start border border-red-500/30 text-red-400 text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div className="flex gap-3 items-center">
            <button onClick={onClose} className="border px-4 py-2 rounded">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-green-600 px-4 py-2 rounded text-nowrap"
            >
              Save Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;
