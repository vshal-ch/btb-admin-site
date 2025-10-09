import apiClient from "./apiClient";

export const getVenue = async () => apiClient.get("/venue");

export const saveVenue = (formData) => apiClient.put(`/admin/venue`, formData);

export const saveCost = (cost) => apiClient.post(`/admin/costs`, cost);

export const editCost = (cost) =>
  apiClient.put(`/admin/costs/${cost.id}`, {
    timings: cost.timings,
    cost: cost.cost,
  });

export const deleteCost = (cost) => apiClient.delete(`/admin/costs/${cost.id}`)