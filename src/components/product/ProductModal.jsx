"use client"

import { useState, useEffect } from "react"
import { storage } from "../../utils/storage.js" // Correct path

export default function ProductModal({ product, onClose, onAddToCart, onRefreshCounts }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)

  useEffect(() => {
    if (product) {
      setIsFavorite(storage.isFavorite(product.id))
      setIsInCart(storage.isInCart(product.id))
    }
  }, [product])

  const handleToggleFavorite = () => {
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

  const handleAddToCart = () => {
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

  if (!product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* Increased max-w to make the modal wider */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col lg:flex-row overflow-hidden transform scale-95 animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors z-10"
          aria-label="Close modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Image */}
        <div className="relative lg:w-1/2">
          <img
            src={`/images/${product.category.toLowerCase()}.jpg`}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg?height=400&width=400"
            }}
            className="w-full h-64 lg:h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h2>
            <div className="flex items-center mb-4">
              <div className="flex items-center text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-current" : "fill-none"}`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-600 text-sm">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>
            {/* Using full description */}
            <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Giảng viên: <span className="font-medium ml-1">{product.instructor}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Thời lượng: <span className="font-medium ml-1">{product.duration}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Cấp độ: <span className="font-medium ml-1">{product.level}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586L5 14.586V10a2 2 0 012-2h4V5a2 2 0 012-2h2zm-6 3H9m3 0h2"
                  />
                </svg>
                Ngôn ngữ: <span className="font-medium ml-1">{product.language}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</span>
            <div className="flex gap-3">
              <button
                onClick={handleToggleFavorite}
                className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                  isFavorite
                    ? "bg-red-500 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500"
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  className="w-6 h-6"
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
              <button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={`px-6 py-3 rounded-xl font-semibold text-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                  isInCart
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:scale-105"
                } min-w-fit`} // Added min-w-fit to prevent text cutting
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 21H19a1 1 0 001-1v-1M7 13l-2.293-2.293c-.63-.63-.184-1.707.707-1.707H17"
                    />
                  </svg>
                  {isInCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
