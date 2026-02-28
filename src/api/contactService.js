import api from "./apiClient"; // your axios instance


export const getContacts = async () => api.get("contact");
export const createContact = async (body) => api.post("/contact", body);
export const updateContact = async (id, body) =>
  api.put(`/contact/${id}`, body);
export const deleteContact = async (id) => api.delete(`/contact/${id}`);

export const createPhone = async (contactId, body) =>
  api.post(`/phone/${contactId}`, body);
export const updatePhone = async (id, body) =>
  api.put(`/phone/${id}`, body);
export const deletePhone = async (id) => api.delete(`/phone/${id}`);
