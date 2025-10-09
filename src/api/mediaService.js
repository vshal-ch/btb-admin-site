import apiClient from "./apiClient";

// ✅ Get all media (sorted by position DESC)
export async function getMedia() {
  return apiClient.get("/admin/media");
}

// ✅ Add media
// For image: { file?, image_url?, description?, position?, type: "image" }
// For video: { youtube_url, description?, position?, type: "video" }
export async function addMedia({ file, image_url, youtube_url, description, position, type }) {
  const formData = new FormData();
  formData.append("type", type);
  if (description) formData.append("description", description);
  if (position) formData.append("position", position);

  if (type === "image") {
    if (file) {
      formData.append("media_data", file);
    } else if (image_url) {
      formData.append("src_url", image_url);
    } else {
      throw new Error("Either image file or image_url is required for type=image");
    }
  } else if (type === "video") {
    if (!youtube_url) throw new Error("YouTube URL is required for type=video");
    formData.append("youtube_url", youtube_url);
  } else {
    throw new Error("Invalid media type");
  }

  return apiClient.post("/admin/media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// ✅ Edit media
export async function editMedia(id, { file, image_url, youtube_url, description, position, type }) {
  const formData = new FormData();
  if (type) formData.append("type", type);
  if (description) formData.append("description", description);
  if (position) formData.append("position", position);

  if (type === "image") {
    if (file) {
      formData.append("media_data", file);
    } else if (image_url) {
      formData.append("src_url", image_url);
    }
  } else if (type === "video" && youtube_url) {
    formData.append("youtube_url", youtube_url);
  }

  return apiClient.put(`/admin/media/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// ✅ Delete media
export async function deleteMedia(id) {
  return apiClient.delete(`/admin/media/${id}`);
}
