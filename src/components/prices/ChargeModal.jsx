import React, { useState, useEffect } from "react";
import { createCharge, updateCharge } from "../../api/chargeService";

const ChargeModal = ({ charge, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: "",
    charge_type: "PERCENT",
    charge_value: "",
    active_from: "",
    active_until: "",
    is_active: true,
    apply_on: "RUNNING",
    priority: undefined,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (charge) {
      setForm({
        ...charge,
        active_from: charge.active_from ? charge.active_from.slice(0, 16) : "",
        active_until: charge.active_until
          ? charge.active_until.slice(0, 16)
          : "",
      });
    }
  }, [charge]);

  const validateForm = () => {
    // Required fields
    if (!form.title?.trim()) {
      return "Title is required.";
    }

    if (!form.charge_type) {
      return "Charge type is required.";
    }

    if (!form.apply_on) {
      return "Apply on is required.";
    }

    if (!form.charge_value) {
      return "Charge value is required.";
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

    // Charge validations
    const charge = Number(form.charge_value);

    if (charge < 0) {
      return "Charge value must not be less than 0.";
    }

    // Priority validation
    if (Number(form.priority) < 0) {
      return "Priority must be 0 or greater.";
    }

    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      console.log("small " + error);

      setError(error);
      return;
    }
    setError("");
    try {
      if (charge?.id) {
        await updateCharge(charge.id, form);
      } else {
        await createCharge(form);
      }
      onSaved();
    } catch (err) {
      console.log(err);

      setError(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 ">
      <div className="bg-gray-900 w-full max-w-xl rounded-2xl shadow-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-green-500">
            {charge ? "Edit Charge" : "Add Charge"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-8">
          {/* Charge Info */}
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
            </div>

            {/* Charge Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Charge Type
                </label>
                <select
                  value={form.charge_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      charge_type: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                >
                  <option value="PERCENT">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Charge Value
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.target.blur()}
                  value={form.charge_value}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      charge_value: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                />
              </div>
            </div>

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

            {/* Active Window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Active From
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
                  Active Until
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
                Priority
              </label>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
              />
              <p className="mt-0.5 text-xs text-gray-400">
                Charge with least priority will be applied first.
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
            </div>
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
              Save Charge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargeModal;
