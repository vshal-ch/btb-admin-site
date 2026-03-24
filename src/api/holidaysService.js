import apiClient from "./apiClient";

export const getHolidays = async () => {
  return apiClient.get("/holidays");
};

export const saveHoliday = (holiday) => apiClient.post(`/holidays`, holiday);

export const updateHoliday = (holiday) =>
  apiClient.put(`/holidays/${holiday.id}`, holiday);

export const deleteHoliday = (id) => apiClient.delete(`/holidays/${id}`);
