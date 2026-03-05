import apiClient from "./apiClient";

export const getOffers = async () => {
  return apiClient.get("/offers");
};

export const createOffer = async (payload) => {
  return apiClient.post("/offers", payload);
};

export const updateOffer = async (id, payload) => {
  return apiClient.put(`/offers/${id}`, payload);
};

export const deleteOffer = async (id) => {
  return apiClient.delete(`/offers/${id}`);
};