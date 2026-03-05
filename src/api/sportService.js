import apiClient from "./apiClient";

export const getSports = async () => {
  return apiClient.get("/sports");
};

export const saveSport = (sport) => apiClient.post(`/sports`, sport);

export const updateSport = (sport) =>
  apiClient.put(`/sports/${sport.id}`, sport);

export const deleteSport = (id) => apiClient.delete(`/sports/${id}`);
