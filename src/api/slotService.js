import apiClient from "./apiClient";

export const getSlots = async (filters = {}, noCache) => {
  let headers = {};
  if (noCache) {
    headers["Cache-Control"] = "no-cache";
    headers["Pragma"] = "no-cache";
    headers["Expires"] = "0";
  }
  return apiClient.get("/slots", { params: filters, headers });
};

export const deleteSlot = (id) => apiClient.delete(`/slots/${id}`);

export const saveSlot = (formData, editSlot) =>
  editSlot
    ? apiClient.put(`/slots/${editSlot.id}`, formData)
    : apiClient.post("/slots", formData);

export const verifyGamePass = async (code) => {
  return apiClient.post(`/slots/verify`, { game_pass_code: code });
};

export const getSlotDetails = async (id) => {
  return apiClient.get(`/slots/id/${id}`);
};

export const markSlotAttended = (id) => apiClient.post(`/slots/${id}/attend`);
