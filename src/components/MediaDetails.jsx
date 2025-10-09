import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Save, X, Play } from "lucide-react";
import {
  getMedia,
  addMedia,
  editMedia,
  deleteMedia,
} from "../api/mediaService";

export default function MediaDetails() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState(null);
  const [form, setForm] = useState({
    type: "image",
    description: "",
    position: "",
    youtube_url: "",
    image_url: "",
    file: null,
  });
  const [viewIndex, setViewIndex] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    try {
      const data = await getMedia();
      setMediaList(data.sort((a, b) => b.position - a.position));
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  }

  function handleOpenAdd() {
    setEditingMedia(null);
    setForm({
      type: "image",
      description: "",
      position: "",
      youtube_url: "",
      image_url: "",
      file: null,
    });
    setModalOpen(true);
  }

  function handleEdit(item) {
    setEditingMedia(item);
    setForm({
      type: item.type,
      description: item.description || "",
      position: item.position || "",
      youtube_url: item.type === "video" ? item.src_url : "",
      image_url: item.type === "image" ? item.src_url : "",
      file: null,
    });
    setModalOpen(true);
  }

  async function handleSave() {
    try {
      setLoading(true);

      if (editingMedia) {
        // edit
        const updated = await editMedia(editingMedia.id, form);
        setMediaList((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
      } else {
        // add
        const added = await addMedia(form);
        setMediaList((prev) => [added, ...prev]);
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
                      item.src_url
                    )}/hqdefault.jpg`}
                    className="absolute inset-0 object-cover opacity-60"
                  />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 w-full text-start">
              <p className="font-semibold text-white">{item.description}</p>
              <p className="text-sm text-gray-400">Type: {item.type}</p>
              <p className="text-sm text-gray-400">
                Position priority: {item.position || "-"}
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
        <div className="fixed inset-0 bg-gray-900/60 flex items-center justify-center z-20">
          <div className="bg-gray-900 p-5 rounded-lg w-full max-w-md relative">
            <h3 className="text-xl font-semibold mb-4 text-[#22c55e]">
              {editingMedia ? "Edit Media" : "Add Media"}
            </h3>

            <label className="block mb-1 text-sm">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-gray-800 rounded p-2 mb-3"
            >
              <option value="image">Image</option>
              <option value="video">Video (YouTube)</option>
            </select>

            {form.type === "image" ? (
              <>
                <label className="block mb-1 text-sm">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, file: e.target.files[0] })
                  }
                  className="mb-3 w-full bg-gray-800 rounded p-2"
                />
                <label className="block mb-1 text-sm">or Image URL</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                  className="w-full bg-gray-800 rounded p-2 mb-3"
                  placeholder="https://example.com/image.jpg"
                />
              </>
            ) : (
              <>
                <label className="block mb-1 text-sm">YouTube URL</label>
                <input
                  type="url"
                  value={form.youtube_url}
                  onChange={(e) =>
                    setForm({ ...form, youtube_url: e.target.value })
                  }
                  className="w-full bg-gray-800 rounded p-2 mb-3"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </>
            )}

            <label className="block mb-1 text-sm">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full bg-gray-800 rounded p-2 mb-3"
            />

            <label className="block mb-1 text-sm">Position priority</label>
            <input
              type="number"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full bg-gray-800 rounded p-2 mb-3"
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-500"
              >
                <X className="inline w-4 h-4 mr-1" /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#22c55e] text-gray-900 font-semibold px-3 py-2 rounded hover:opacity-90"
              >
                <Save className="inline w-4 h-4 mr-1" /> Save
              </button>
            </div>
          </div>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white text-lg font-semibold z-50">
              Uploading...
            </div>
          )}
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
                /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
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
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : "";
}
