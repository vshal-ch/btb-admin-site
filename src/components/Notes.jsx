import { useEffect, useState } from "react";
import { Edit, Trash2, Phone, Plus, X } from "lucide-react";
import { getActiveOfferText, saveActiveOfferText } from "../api/noteService"; // ← you'll create this API helper file

export default function Notes() {
  const [activeOfferText, setActiveOfferText] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ note: "" });

  // ✅ Fetch all contacts on mount
  useEffect(() => {
    fetchActiveOfferText();
  }, []);

  const fetchActiveOfferText = async () => {
    setLoading(true);
    try {
      const data = await getActiveOfferText();
      console.log(data);

      if (!data) {
        setLoading(false);
        return;
      }
      setActiveOfferText(data.note);
      setFormData((f) => ({ ...f, note: data.note }));
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  // ✅ Add / Edit contact
  const handleSaveActiveOfferText = async () => {
    if (!formData.note.trim()) return alert("Note is required");
    setLoading(true);
    try {
      let data = await saveActiveOfferText(formData);
      if (!data) {
        setLoading(false);
        return;
      }
      setActiveOfferText(data.note);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  return (
    <div className="relative py-6 max-w-3xl mx-auto">
      {/* Overlay Loader */}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="text-white text-lg font-semibold">Loading...</div>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-start mb-8 text-bright-green">
        Notes
      </h2>

      <h3 className="text-left text-xl font-semibold mb-4 text-white">
        Active Offer Text
      </h3>
      <div className="flex flex-col gap-3">
        <textarea
          type="text"
          placeholder="Active Offer Text"
          value={formData.note}
          onChange={(e) => setFormData((f) => ({ ...f, note: e.target.value }))}
          className="input"
        />
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={() => setFormData((f) => ({ ...f, note: activeOfferText }))}
          className="text-gray-300 hover:text-white"
        >
          Reset
        </button>
        <button
          onClick={handleSaveActiveOfferText}
          className="bg-bright-green text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}
