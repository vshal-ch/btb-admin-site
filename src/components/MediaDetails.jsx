import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, Play } from "lucide-react";
import {
  getMedia,
  addMedia,
  editMedia,
  deleteMedia,
} from "../api/mediaService";
import ImageCategoryToggle from "./misc/ImageCategoryToggle";

const defaultForm = {
  category: "promo-banner",
  title: "",
  active: true,
  type: "image",
  description: "",
  position: "",
  youtube_url: "",
  image_url: "",
  file: null,
};

export default function MediaDetails() {
  const [mediaList, setMediaList] = useState([]);
  const [category, setCategory] = useState("promo-banner");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [viewIndex, setViewIndex] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, [category]);

  async function fetchMedia() {
    setLoading(true);
    try {
      const data = await getMedia(category);
      setMediaList(data.sort((a, b) => b.position - a.position));
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  }

  function handleOpenAdd() {
    setEditingMedia(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function handleEdit(item) {
    setEditingMedia(item);
    setForm({
      category: item.category,
      title: item.title,
      active: item.active,
      type: item.type,
      description: item.description || "",
      position: item.position || "",
      youtube_url: item.type === "video" ? item.src_url : "",
      image_url: item.type === "image" ? item.src_url : "",
      file: null,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (form.title.trim() === "") {
      alert("Title is required");
      return;
    }
    if (
      form.type === "video" &&
      extractYouTubeId(form.youtube_url.trim()) === ""
    ) {
      alert("Invalid Youtube URL");
      return;
    }
    if (form.type === "image" && form.file == null && form.image_url == "") {
      alert("Either image file or image url is required.");
      return;
    }

    try {
      setLoading(true);

      if (editingMedia) {
        const updated = await editMedia(editingMedia.id, form);
        if (category === updated.category) {
          setMediaList((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m)),
          );
        } else {
          setMediaList((prev) => prev.filter((m) => m.id !== updated.id));
        }
      } else {
        // add
        const added = await addMedia(form);
        if (category === added.category) {
          setMediaList((prev) => [added, ...prev]);
        }
      }

      setModalOpen(false);
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this media?")) return;
    try {
      await deleteMedia(id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      alert(err);
    }
  }

  const next = () => setViewIndex((i) => (i + 1) % mediaList.length);
  const prev = () =>
    setViewIndex((i) => (i - 1 + mediaList.length) % mediaList.length);

  return (
    <div className="relative py-4 max-w-3xl">
      {loading && (
        <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
          <div className="text-white text-lg font-semibold">Loading...</div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-start font-semibold">Photos & Media</h2>

        <div className="flex justify-end">
          <button
            onClick={handleOpenAdd}
            className="bg-[#22c55e] text-gray-900 font-medium px-3 py-2 rounded-md hover:opacity-90"
          >
            <Plus className="inline w-4 h-4 mr-1" /> Add Media
          </button>
        </div>
      </div>

      {/* Category toggle */}
      <ImageCategoryToggle
        value={category}
        onChange={(cat) => {
          setCategory(cat);
        }}
      />

      {/* List of media */}
      <div className="grid gap-4">
        {mediaList.map((item, i) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-start gap-3"
          >
            {/* Thumbnail */}
            <div
              className="relative w-full sm:w-32 aspect-video bg-gray-700 rounded overflow-hidden"
              onClick={() => setViewIndex(i)}
            >
              {item.type === "image" ? (
                <img
                  src={item.src_url}
                  alt="media"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                  <Play className="text-white w-10 h-10 opacity-70" />
                  <img
                    src={`https://img.youtube.com/vi/${extractYouTubeId(
                      item.src_url,
                    )}/hqdefault.jpg`}
                    className="absolute inset-0 object-cover opacity-60"
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-start">
              <p className="font-semibold text-white">{item.title}</p>
              <p className="text-sm text-gray-400">{item.description}</p>
              <p className="text-sm text-gray-400">Type: {item.type}</p>
              <p className="text-sm text-gray-400">
                Status: {item.active ? "active" : "inactive"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 self-end sm:self-center">
              <button
                onClick={() => handleEdit(item)}
                className="p-2 bg-blue-600 rounded hover:bg-blue-500"
              >
                <Edit className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 bg-red-600 rounded hover:bg-red-500"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 p-4">
          <form className="bg-gray-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[95vh] relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-xl font-semibold text-green-500">
                {editingMedia ? "Edit Media" : "Add Media"}
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6 overflow-y-auto space-y-6">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="venue">Venue</option>
                    <option value="promo-banner">Banner</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={form.active ? "active" : "inactive"}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.value === "active" })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Title (max 100 characters) required
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.title}
                  required
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {form.title?.length || 0}/100
                </div>
              </div>
              {/* Description & Position */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Media Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Media Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video (YouTube)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Position Priority
                  </label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    value={form.position}
                    onChange={(e) =>
                      setForm({ ...form, position: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  />
                </div>
              </div>

              {/* Conditional Media Fields */}
              {form.type === "image" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setForm({ ...form, file: e.target.files[0] })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">
                      Or Image URL
                    </label>
                    <input
                      type="url"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm({ ...form, image_url: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                      className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={form.youtube_url}
                    onChange={(e) =>
                      setForm({ ...form, youtube_url: e.target.value })
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800"
              >
                <X className="inline w-4 h-4 mr-1" />
                Cancel
              </button>

              <button
                onClick={handleSave}
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium"
              >
                <Save className="inline w-4 h-4 mr-1" />
                Save
              </button>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white text-lg font-semibold rounded-2xl">
                Uploading...
              </div>
            )}
          </form>
        </div>
      )}
      {viewIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center">
          <button
            onClick={() => setViewIndex(null)}
            className="absolute top-4 right-6 text-white text-3xl"
          >
            ✕
          </button>
          <button
            onClick={prev}
            className="absolute left-4 text-white text-3xl select-none"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 text-white text-3xl select-none"
          >
            ›
          </button>

          {mediaList[viewIndex].type === "image" ? (
            <img
              src={mediaList[viewIndex].src_url}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded shadow-lg"
            />
          ) : (
            (() => {
              const src = mediaList[viewIndex].src_url;
              // Extract video ID from different YouTube URL formats
              const match = src.match(
                /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
              );
              const videoId = match ? match[1] : null;

              return videoId ? (
                <iframe
                  className="w-[80vw] h-[60vh] rounded"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  allowFullScreen
                ></iframe>
              ) : (
                <p className="text-white text-sm">Invalid YouTube URL</p>
              );
            })()
          )}
          <p className="text-white mt-4 text-sm">
            {mediaList[viewIndex].description}
          </p>
        </div>
      )}
    </div>
  );
}

/* Utility: extract YouTube video ID */
function extractYouTubeId(url) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/,
  );
  return match ? match[1] : "";
}
