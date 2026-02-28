import apiClient from "./apiClient";

export const getVenue = async () => apiClient.get("/venue");

export const saveVenue = (formData) => apiClient.put(`/venue`, formData);

export const saveCost = (cost) => apiClient.post(`/costs`, cost);

export const updateCost = (cost) =>
  apiClient.put(`/costs/${cost.id}`, {
    sport_id: cost.sport_id,
    cost: cost.cost,
    evening_cost: cost.evening_cost,
    weekend_cost: cost.weekend_cost,
  });

export const deleteCost = (cost) => apiClient.delete(`/costs/${cost.id}`);
