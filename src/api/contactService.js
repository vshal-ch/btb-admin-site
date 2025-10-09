import api from "./apiClient"; // your axios instance


export const getContacts = async () => api.get("contact");
export const createContact = async (body) => api.post("/admin/contact", body);
export const updateContact = async (id, body) =>
  api.put(`/admin/contact/${id}`, body);
export const deleteContact = async (id) => api.delete(`/admin/contact/${id}`);

export const createPhone = async (contactId, body) =>
  api.post(`/admin/phone/${contactId}`, body);
export const updatePhone = async (id, body) =>
  api.put(`/admin/phone/${id}`, body);
export const deletePhone = async (id) => api.delete(`/admin/phone/${id}`);
