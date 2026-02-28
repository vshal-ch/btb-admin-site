import React from "react";

const ImageCategoryToggle = ({ value, onChange }) => {
  return (
    <div className="w-fit flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-6 ">
      <label className="block text-sm text-gray-400">Image Category</label>

      <div className="w-48 h-10 relative inline-flex bg-gray-800 border border-gray-700 rounded-xl p-1 box-content">
        {/* Sliding background */}
        <div
          className={`absolute top-1 bottom-1 w-24 rounded-lg bg-green-600 transition-all duration-300 ${
            value === "venue" ? "translate-x-24" : "translate-x-0"
          }`}
        />

        {/* Banner */}
        <button
          type="button"
          onClick={() => onChange("promo-banner")}
          className={`relative z-10 w-full h-full text-sm font-medium rounded-lg transition-colors duration-200 ${
            value === "promo-banner" ? "text-white" : " hover:text-gray-200"
          }`}
        >
          Banner
        </button>

        {/* Venue */}
        <button
          type="button"
          onClick={() => onChange("venue")}
          className={`relative z-10 w-full h-full flex items-center justify-center text-sm font-medium rounded-lg transition-colors duration-200 ${
            value === "venue" ? "text-white" : " hover:text-gray-200"
          }`}
        >
          Venue
        </button>
      </div>
    </div>
  );
};

export default ImageCategoryToggle;
