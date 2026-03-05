import apiClient from "./apiClient";

export const getCharges = async () => {
  return apiClient.get("/charges");
};

export const createCharge = async (payload) => {
  return apiClient.post("/charges", payload);
};

export const updateCharge = async (id, payload) => {
  return apiClient.put(`/charges/${id}`, payload);
};

export const deleteCharge = async (id) => {
  return apiClient.delete(`/charges/${id}`);
};
