import apiClient from "./apiClient";

export const getVenue = async () => apiClient.get("/venue");

export const saveVenue = (formData) => apiClient.put(`/admin/venue`, formData);

export const saveCost = (cost) => apiClient.post(`/admin/costs`, cost);

export const updateCost = (cost) =>
  apiClient.put(`/admin/costs/${cost.id}`, {
    sport_id: cost.sport_id,
    cost: cost.cost,
    evening_cost: cost.evening_cost,
    weekend_cost: cost.weekend_cost,
  });

export const deleteCost = (cost) => apiClient.delete(`/admin/costs/${cost.id}`);
