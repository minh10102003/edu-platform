"use client"

import { useState } from "react"

const priceRanges = [
  { label: "Tất cả", min: 0, max: Infinity, id: "all" },
  { label: "Miễn phí", min: 0, max: 0, id: "free" },
  { label: "Dưới 500K", min: 1, max: 500000, id: "under500k" },
  { label: "500K - 1 triệu", min: 500000, max: 1000000, id: "500k-1m" },
  { label: "1 - 2 triệu", min: 1000000, max: 2000000, id: "1m-2m" },
  { label: "Trên 2 triệu", min: 2000000, max: Infinity, id: "over2m" },
]

const ratingOptions = [
  { label: "Tất cả đánh giá", value: "all", stars: 0 },
  { label: "4.5 ★ trở lên", value: "4.5up", stars: 4.5 },
  { label: "4.0 ★ trở lên", value: "4up", stars: 4 },
  { label: "3.5 ★ trở lên", value: "3.5up", stars: 3.5 },
  { label: "3.0 ★ trở lên", value: "3up", stars: 3 },
]

const levelOptions = [
  { label: "Tất cả cấp độ", value: "all" },
  { label: "Cơ bản", value: "beginner" },
  { label: "Trung cấp", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
]

export default function FilterPanel({
  categories = [],
  selectedCategory = "all",
  onCategoryChange,
  selectedPriceRange = { min: 0, max: Infinity },
  onPriceChange,
  selectedRating = "all",
  onRatingChange,
  selectedLevel = "all",
  onLevelChange,
  onClearAll,
  isCollapsed = false,
  onToggleCollapse,
}) {
  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
    rating: true,
    level: true,
  })

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatPrice = (price) => {
    if (price === 0) return "Miễn phí"
    if (price === Infinity) return "Không giới hạn"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  const renderStars = (count) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < count ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))
  }

  const hasActiveFilters = 
    selectedCategory !== "all" || 
    selectedPriceRange.min !== 0 || 
    selectedPriceRange.max !== Infinity ||
    selectedRating !== "all" ||
    selectedLevel !== "all"

  if (isCollapsed) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-medium text-gray-900">Bộ lọc</span>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Đang lọc
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                onClick={onClearAll}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Xóa tất cả
              </button>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h3 className="font-bold text-xl text-gray-900">Bộ lọc</h3>
          {hasActiveFilters && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Đang lọc
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
            >
              Xóa tất cả
            </button>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection("category")}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h4 className="font-semibold text-gray-900">Danh mục</h4>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.category ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {openSections.category && (
          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <input
                type="radio"
                name="category"
                value="all"
                checked={selectedCategory === "all"}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className={`text-sm ${selectedCategory === "all" ? "font-medium text-blue-600" : "text-gray-700"}`}>
                Tất cả danh mục
              </span>
            </label>
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className={`text-sm capitalize ${selectedCategory === category ? "font-medium text-blue-600" : "text-gray-700"}`}>
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h4 className="font-semibold text-gray-900">Khoảng giá</h4>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.price ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {openSections.price && (
          <div className="space-y-2">
            {priceRanges.map((range) => {
              const isSelected =
                selectedPriceRange.min === range.min && selectedPriceRange.max === range.max
              
              return (
                <label
                  key={range.id}
                  className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={isSelected}
                    onChange={() => onPriceChange({ min: range.min, max: range.max })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className={`text-sm ${isSelected ? "font-medium text-blue-600" : "text-gray-700"}`}>
                    {range.label}
                  </span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-b border-gray-100 pb-4">
        <button
          onClick={() => toggleSection("rating")}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h4 className="font-semibold text-gray-900">Đánh giá</h4>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.rating ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {openSections.rating && (
          <div className="space-y-2">
            {ratingOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={selectedRating === option.value}
                  onChange={(e) => onRatingChange(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="flex items-center gap-2">
                  {option.stars > 0 && (
                    <div className="flex items-center">
                      {renderStars(option.stars)}
                    </div>
                  )}
                  <span className={`text-sm ${selectedRating === option.value ? "font-medium text-blue-600" : "text-gray-700"}`}>
                    {option.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Level Filter */}
      <div>
        <button
          onClick={() => toggleSection("level")}
          className="flex items-center justify-between w-full mb-3 text-left"
        >
          <h4 className="font-semibold text-gray-900">Cấp độ</h4>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              openSections.level ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {openSections.level && (
          <div className="space-y-2">
            {levelOptions.map((option) => {
              const getLevelColor = (level) => {
                switch (level) {
                  case "beginner": return "text-green-600"
                  case "intermediate": return "text-amber-600"
                  case "advanced": return "text-red-600"
                  default: return "text-gray-700"
                }
              }
              
              const getLevelDots = (level) => {
                const dots = {
                  beginner: 1,
                  intermediate: 2,
                  advanced: 3
                }
                return dots[level] || 0
              }
              
              return (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    name="level"
                    value={option.value}
                    checked={selectedLevel === option.value}
                    onChange={(e) => onLevelChange?.(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex items-center gap-2">
                    {option.value !== "all" && (
                      <div className="flex gap-0.5">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < getLevelDots(option.value) 
                                ? getLevelColor(option.value).replace('text-', 'bg-')
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className={`text-sm ${selectedLevel === option.value ? "font-medium text-blue-600" : getLevelColor(option.value)}`}>
                      {option.label}
                    </span>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h5 className="font-medium text-blue-900 mb-2">Bộ lọc đang áp dụng:</h5>
          <div className="space-y-1 text-sm text-blue-800">
            {selectedCategory !== "all" && (
              <div>• Danh mục: <span className="font-medium capitalize">{selectedCategory}</span></div>
            )}
            {(selectedPriceRange.min !== 0 || selectedPriceRange.max !== Infinity) && (
              <div>• Giá: <span className="font-medium">
                {formatPrice(selectedPriceRange.min)} - {formatPrice(selectedPriceRange.max)}
              </span></div>
            )}
            {selectedRating !== "all" && (
              <div>• Đánh giá: <span className="font-medium">
                {ratingOptions.find(r => r.value === selectedRating)?.label}
              </span></div>
            )}
            {selectedLevel !== "all" && (
              <div>• Cấp độ: <span className="font-medium">
                {levelOptions.find(l => l.value === selectedLevel)?.label}
              </span></div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}