import apiClient from "./apiClient";

export const getSlots = async (filters = {}, noCache) => {
  let headers = {};
  if (noCache) {
    headers["Cache-Control"] = "no-cache";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
  }
  return apiClient.get("/admin/slots/all", { params: filters, headers });
};

export const deleteSlot = (id) => apiClient.delete(`/admin/slots/${id}`);

export const saveSlot = (formData, editSlot) =>
  editSlot
    ? apiClient.put(`/admin/slots/${editSlot.id}`, formData)
    : apiClient.post("/admin/slots", formData);
