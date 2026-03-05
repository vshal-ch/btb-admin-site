import apiClient from "./apiClient";

/**
 * Fetch monthly reservations
 * @param {Object} params
 * @param {string} params.status - ACTIVE | UPCOMING | EXPIRED | CANCELLED | ALL
 * @param {string} params.search - search by name or phone
 */
export const getMonthlyReservations = (params = {}) => {
  try {
    return apiClient.get("/reservations", {
      params,
    });
  } catch (err) {
    throw err?.response?.data?.error || "Failed to fetch monthly reservations";
  }
};

/**
 * Create or Update monthly reservation
 * Handles overlap warning logic
 *
 * @param {Object} payload
 * @param {boolean} force - override overlap warning
 */
export const saveMonthlyReservation = async (payload, force = false) => {
  try {
    const config = {
      params: force ? { force: true } : {},
    };

    if (payload.id) {
      // Update
      return apiClient.put(`/reservations/${payload.id}`, payload, config);
    } else {
      // Create
      return apiClient.post("reservations", payload, config);
    }
  } catch (err) {
    throw err?.response?.data?.error || "Failed to save monthly reservation";
  }
};

/**
 * Delete monthly reservation
 */
export const deleteMonthlyReservation = async (id) => {
  try {
    return apiClient.delete(`/reservations/${id}`);
  } catch (err) {
    throw err?.response?.data?.error || "Failed to delete reservation";
  }
};
