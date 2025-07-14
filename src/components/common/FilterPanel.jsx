import React from 'react';

const priceRanges = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K - 1 triệu', min: 500000, max: 1000000 },
  { label: 'Trên 1 triệu', min: 1000000, max: Infinity }
];

const ratingOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: '4 ★ trở lên', value: '4up' },
  { label: '3 ★ trở lên', value: '3up' }
];

export default function FilterPanel({
  categories = [],               // mảng các category có trong sản phẩm
  selectedCategory = 'all',      // giá trị category đang chọn
  onCategoryChange,              // fn(newCategory)
  selectedPriceRange = { min: 0, max: Infinity },
  onPriceChange,                 // fn({ min, max })
  selectedRating = 'all',
  onRatingChange,                // fn(newRating)
  onClearAll                     // fn() để reset tất cả bộ lọc
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6 sticky top-24">
      {/* Header + Clear */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-xl">Bộ lọc</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:underline"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Theo danh mục */}
      <div>
        <h4 className="font-semibold mb-2">Theo danh mục</h4>
        <select
          value={selectedCategory}
          onChange={e => onCategoryChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Theo giá */}
      <div>
        <h4 className="font-semibold mb-2">Theo giá</h4>
        <div className="space-y-2">
          {priceRanges.map((range, idx) => {
            const checked =
              selectedPriceRange.min === range.min &&
              selectedPriceRange.max === range.max;

            return (
              <label
                key={idx}
                className="flex items-center space-x-2 cursor-pointer hover:text-blue-600"
              >
                <input
                  type="radio"
                  name="priceRange"
                  checked={checked}
                  onChange={() => onPriceChange({ min: range.min, max: range.max })}
                  className="h-4 w-4 text-blue-600"
                />
                <span>{range.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Theo đánh giá */}
      <div>
        <h4 className="font-semibold mb-2">Theo đánh giá</h4>
        <div className="space-y-2">
          {ratingOptions.map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center space-x-2 cursor-pointer hover:text-yellow-600"
            >
              <input
                type="radio"
                name="rating"
                checked={selectedRating === opt.value}
                onChange={() => onRatingChange(opt.value)}
                className="h-4 w-4 text-yellow-500"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
