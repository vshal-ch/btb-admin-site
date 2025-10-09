import { useEffect, useState } from "react";
import { Edit, Trash2, Phone, Plus, X } from "lucide-react";
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  createPhone,
  updatePhone,
  deletePhone,
} from "../api/contactService"; // ← you'll create this API helper file

function getJustContact(contact) {
  return { id: contact.id, name: contact.name, email: contact.email };
}

export default function ContactDetails() {
  const [contacts, setContacts] = useState([]);
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // "addContact" | "editContact" | "addPhone" | "editPhone"
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [phoneForm, setPhoneForm] = useState({ type: "tel", phone_no: "" });

  // ✅ Fetch all contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await getContacts();
      setContacts(data.map((c) => getJustContact(c)));
      let phones = [];
      data.forEach((c) => phones.push(...c.phones));
      setPhones(phones);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  // ✅ Add / Edit contact
  const handleSaveContact = async () => {
    if (!formData.name.trim()) return alert("Name is required");
    setLoading(true);
    try {
      let res;
      if (modal === "addContact") {
        res = await createContact(formData);
        setContacts((prev) => [...prev, getJustContact(res)]);
      } else if (modal === "editContact") {
        res = await updateContact(selectedContact.id, formData);

        setContacts((prev) => {
          return prev.map((c) =>
            c.id === selectedContact.id ? getJustContact(res) : c
          );
        });
      }
      setModal(null);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Delete this contact?")) return;
    setLoading(true);
    try {
      await deleteContact(contactId);
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch {
      alert("Failed to delete contact");
    }
    setLoading(false);
  };

  // ✅ Add / Edit phone
  const handleSavePhone = async () => {
    if (!phoneForm.phone_no.trim()) return alert("Phone number required");
    setLoading(true);
    try {
      let res;
      if (modal === "addPhone") {
        res = await createPhone(selectedContact.id, phoneForm);
        setPhones((prev) => [...prev, res]);
      } else if (modal === "editPhone") {
        res = await updatePhone(phoneForm.id, phoneForm);
        setPhones((prev) => prev.map((p) => (p.id === res.id ? res : p)));
      }
      setModal(null);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  const handleDeletePhone = async (contactId, phoneId) => {
    if (!window.confirm("Delete this phone?")) return;
    setLoading(true);
    try {
      await deletePhone(phoneId);
      setPhones((prev) => prev.filter((p) => p.id !== phoneId));
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

      <h2 className="text-2xl font-semibold text-start mb-4 text-bright-green">
        Contact Details
      </h2>

      <div className="flex flex-col gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-gray-800 p-4 rounded-lg shadow-md relative"
          >
            {/* Contact header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg text-start font-semibold text-white">
                  {contact.name || "(No name)"}
                </h3>
                {contact.email && (
                  <p className="text-gray-400 text-sm">{contact.email}</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModal("editContact");
                    setSelectedContact(contact);
                    setFormData({ name: contact.name, email: contact.email });
                  }}
                  className="text-gray-300 hover:text-bright-green"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="text-gray-300 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Phones section */}
            <div className="mt-4">
              <h4 className="text-sm text-start text-gray-400 font-semibold mb-2">
                Phones
              </h4>
              <div className="flex flex-col gap-2">
                {phones
                  .filter((p) => p.contact_id === contact.id)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center bg-gray-700 rounded-md px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-bright-green" />
                        <div>
                          <span className="block text-xs text-start text-gray-400">
                            {p.type}
                          </span>
                          <span className="text-white text-sm">
                            {p.phone_no}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setModal("editPhone");
                            setSelectedContact(contact);
                            setPhoneForm(p);
                          }}
                          className="text-gray-300 hover:text-bright-green"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePhone(contact.id, p.id)}
                          className="text-gray-300 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}

                {/* Add Phone link */}
                <button
                  onClick={() => {
                    setModal("addPhone");
                    setSelectedContact(contact);
                    setPhoneForm({ type: "tel", phone_no: "" });
                  }}
                  className="text-sm text-bright-green text-left mt-2"
                >
                  + Add Phone
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Button */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            setModal("addContact");
            setFormData({ name: "", email: "" });
          }}
          className="flex items-center gap-2 bg-bright-green text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          <Plus size={18} />
          Add Contact
        </button>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20 px-4">
          <div className="bg-gray-800 p-5 rounded-lg w-full max-w-sm relative">
            <button
              onClick={() => setModal(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={18} />
            </button>

            {/* Contact Modal */}
            {(modal === "addContact" || modal === "editContact") && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {modal === "addContact" ? "Add Contact" : "Edit Contact"}
                </h3>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, name: e.target.value }))
                    }
                    className="input"
                  />
                  <input
                    type="email"
                    placeholder="Email (optional)"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, email: e.target.value }))
                    }
                    className="input"
                  />
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setModal(null)}
                    className="text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContact}
                    className="bg-bright-green text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    {modal === "addContact" ? "Add" : "Save"}
                  </button>
                </div>
              </>
            )}

            {/* Phone Modal */}
            {(modal === "addPhone" || modal === "editPhone") && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {modal === "addPhone" ? "Add Phone" : "Edit Phone"}
                </h3>
                <div className="flex flex-col gap-3">
                  <select
                    value={phoneForm.type}
                    onChange={(e) =>
                      setPhoneForm((f) => ({ ...f, type: e.target.value }))
                    }
                    className="input"
                  >
                    <option value="tel">Tel</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={phoneForm.phone_no}
                    onChange={(e) =>
                      setPhoneForm((f) => ({ ...f, phone_no: e.target.value }))
                    }
                    className="input"
                  />
                </div>

                <div className="mt-5 flex justify-end gap-3">
                  <button
                    onClick={() => setModal(null)}
                    className="text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePhone}
                    className="bg-bright-green text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    {modal === "addPhone" ? "Add" : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
