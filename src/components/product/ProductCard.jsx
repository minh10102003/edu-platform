"use client"

import { useState, useEffect } from "react"
import { storage } from "../../utils/storage.js" // Correct path

export default function ProductCard({ product, onViewDetail, onToggleFavorite, onRefreshCounts }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)

  useEffect(() => {
    if (product) {
      setIsFavorite(storage.isFavorite(product.id))
      setIsInCart(storage.isInCart(product.id))
    }
  }, [product])

  const handleToggleFavorite = (e) => {
    e.stopPropagation() // Prevent triggering onViewDetail
    if (product) {
      if (isFavorite) {
        storage.removeFavorite(product.id)
        showToast("Đã xóa khỏi yêu thích", "info")
      } else {
        storage.addFavorite(product.id)
        showToast("Đã thêm vào yêu thích", "success")
      }
      setIsFavorite(!isFavorite)
      onRefreshCounts() // Call refresh counts
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation() // Prevent triggering onViewDetail
    if (product) {
      storage.addToCart(product)
      setIsInCart(true)
      showToast("Đã thêm vào giỏ hàng", "success")
      onRefreshCounts() // Call refresh counts
    }
  }

  const showToast = (message, type = "default") => {
    const toast = document.createElement("div")
    const bgColor =
      type === "success"
        ? "bg-green-500"
        : type === "error"
          ? "bg-red-500"
          : type === "info"
            ? "bg-blue-500"
            : "bg-gray-800"
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up flex items-center gap-2`
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
      </svg>
      ${message}
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  const getCategoryColor = (category) => {
    const colors = {
      art: "bg-pink-100 text-pink-700 border-pink-200",
      business: "bg-blue-100 text-blue-700 border-blue-200",
      design: "bg-purple-100 text-purple-700 border-purple-200",
      music: "bg-green-100 text-green-700 border-green-200",
      programming: "bg-orange-100 text-orange-700 border-orange-200",
      photography: "bg-indigo-100 text-indigo-700 border-indigo-200",
      marketing: "bg-red-100 text-red-700 border-red-200",
      english: "bg-yellow-100 text-yellow-700 border-yellow-200",
      finance: "bg-emerald-100 text-emerald-700 border-emerald-200",
      health: "bg-teal-100 text-teal-700 border-teal-200",
    }
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getLevelIcon = (level) => {
    if (level.toLowerCase().includes("beginner")) {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs font-medium">Cơ bản</span>
        </div>
      )
    }
    if (level.toLowerCase().includes("intermediate")) {
      return (
        <div className="flex items-center gap-1 text-yellow-600">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs font-medium">Trung cấp</span>
        </div>
      )
    }
    if (level.toLowerCase().includes("advanced")) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs font-medium">Nâng cao</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1 text-blue-600">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
        <span className="text-xs font-medium">Tất cả</span>
      </div>
    )
  }

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 cursor-pointer transform hover:-translate-y-1"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative overflow-hidden">
        <img
          src={`/images/${product.category.toLowerCase()}.jpg`}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=200&width=300"
          }}
          className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getCategoryColor(
              product.category,
            )}`}
          >
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </span>
        </div>

        {/* Favorite Button (Always visible) */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
            isFavorite
              ? "bg-red-500 text-white shadow-lg"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className="w-4 h-4"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{product.shortDescription}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="font-semibold text-sm text-gray-900">{product.rating}</span>
            <span className="text-gray-400 text-xs">({product.reviews})</span>
          </div>
          {getLevelIcon(product.level)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
              isInCart
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-md hover:shadow-lg"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 21H19a1 1 0 001-1v-1M7 13l-2.293-2.293c-.63-.63-.184-1.707.707-1.707H17"
              />
            </svg>
            <span className="whitespace-nowrap">{isInCart ? "Đã thêm" : "Thêm vào giỏ"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
