import apiClient from "./apiClient";

export const getSports = async () => {
  return apiClient.get("/admin/sports");
};

export const saveSport = (sport) => apiClient.post(`/admin/sports`, { sport });

export const updateSport = (sport) =>
  apiClient.put(`/admin/sports/${sport.id}`, {
    sport: sport.name,
  });

export const deleteSport = (id) => apiClient.delete(`/admin/sports/${id}`);
