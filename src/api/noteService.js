import api from "./apiClient"; // your axios instance

export const getActiveOfferText = async () => api.get("/notes/offer-text");
export const saveActiveOfferText = async (body) =>
  api.post("/notes/offer-text", body);
