import apiClient from "./apiClient";

export const getAmenities = async () => {
  return apiClient.get("/amenities");
};

export const saveAmenity = (amenity) =>
  apiClient.post(`/amenities`, { amenity });

export const updateAmenity = (amenity) =>
  apiClient.put(`/amenities/${amenity.id}`, {
    amenity: amenity.amenity,
  });

export const deleteAmenity = (id) => apiClient.delete(`/amenities/${id}`);
