/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { storage } from "../../utils/storage.js"

// Toast notification system
const createToast = (message, type = "default") => {
  const toast = document.createElement("div")
  const icon = type === "success" ? "✓" : type === "error" ? "⚠" : type === "info" ? "ℹ" : "✓"
  const bgColor = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    default: "bg-gray-800"
  }[type]

  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-down flex items-center gap-2 max-w-sm`
  toast.innerHTML = `
    <span class="text-sm font-medium">${icon}</span>
    <span class="text-sm">${message}</span>
  `
  
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.animation = "fadeOut 0.3s ease-out forwards"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

export default function ProductCard({ 
  product, 
  onViewDetail, 
  onRefreshCounts, 
  viewMode = "grid" 
}) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (product) {
      setIsFavorite(storage.isFavorite(product.id))
      setIsInCart(storage.isInCart(product.id))
    }
  }, [product])

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    if (!product) return

    try {
      if (isFavorite) {
        storage.removeFavorite(product.id)
        createToast("Đã xóa khỏi danh sách yêu thích", "info")
      } else {
        storage.addFavorite(product.id)
        createToast("Đã thêm vào danh sách yêu thích", "success")
      }
      setIsFavorite(!isFavorite)
      onRefreshCounts?.()
    } catch (error) {
      createToast("Có lỗi xảy ra, vui lòng thử lại", "error")
    }
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!product || isInCart) return

    try {
      storage.addToCart(product)
      setIsInCart(true)
      createToast("Đã thêm vào giỏ hàng", "success")
      onRefreshCounts?.()
    } catch (error) {
      createToast("Có lỗi xảy ra, vui lòng thử lại", "error")
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { 
      style: "currency", 
      currency: "VND" 
    }).format(price)
  }

  const getCategoryColor = (category) => {
    const colors = {
      art: "bg-pink-50 text-pink-700 border-pink-200",
      business: "bg-blue-50 text-blue-700 border-blue-200",
      design: "bg-purple-50 text-purple-700 border-purple-200",
      music: "bg-green-50 text-green-700 border-green-200",
      programming: "bg-orange-50 text-orange-700 border-orange-200",
      photography: "bg-indigo-50 text-indigo-700 border-indigo-200",
      marketing: "bg-red-50 text-red-700 border-red-200",
      english: "bg-yellow-50 text-yellow-700 border-yellow-200",
      finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
      health: "bg-teal-50 text-teal-700 border-teal-200",
    }
    return colors[category?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const getLevelBadge = (level) => {
    const levelConfig = {
      beginner: { color: "text-green-600", bg: "bg-green-50", dots: 1, label: "Cơ bản" },
      intermediate: { color: "text-amber-600", bg: "bg-amber-50", dots: 2, label: "Trung cấp" },
      advanced: { color: "text-red-600", bg: "bg-red-50", dots: 3, label: "Nâng cao" }
    }
    
    const config = levelConfig[level?.toLowerCase()] || levelConfig.beginner
    
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${config.bg}`}>
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }, (_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full ${
                i < config.dots ? config.color.replace('text-', 'bg-') : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
      </div>
    )
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))
  }

  if (!product) {
    return <div className="bg-gray-100 rounded-xl h-96 animate-pulse" />
  }

  // List view layout
  if (viewMode === "list") {
    return (
      <div
        className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer"
        onClick={() => onViewDetail(product)}
      >
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <img
              src={imageError ? "/placeholder.svg?height=128&width=192" : `/images/${product.category?.toLowerCase()}.jpg`}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true)
                setImageLoaded(true)
              }}
              className={`w-full h-full object-cover transition-all duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            
            {/* Category badge */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(product.category)}`}>
                {product.category}
              </span>
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-2 line-clamp-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                  <span className="font-medium text-sm text-gray-900 ml-1">{product.rating}</span>
                  <span className="text-gray-500 text-xs">({product.reviews})</span>
                </div>
                {getLevelBadge(product.level)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    isFavorite
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500"
                  }`}
                  aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                  <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isInCart
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isInCart ? "Đã thêm" : "Thêm vào giỏ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view layout
  return (
    <div
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 cursor-pointer card-hover"
      onClick={() => onViewDetail(product)}
    >
      <div className="relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center h-48">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <img
          src={imageError ? "/placeholder.svg?height=192&width=300" : `/images/${product.category?.toLowerCase()}.jpg`}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(true)
          }}
          className={`w-full h-48 object-cover transition-all duration-500 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(product.category)}`}>
            {product.category}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200 hover:scale-110 ${
            isFavorite
              ? "bg-red-500 text-white shadow-md"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
          }`}
          aria-label={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
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
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {renderStars(product.rating)}
            <span className="font-medium text-sm text-gray-900 ml-1">{product.rating}</span>
            <span className="text-gray-500 text-xs">({product.reviews})</span>
          </div>
          {getLevelBadge(product.level)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
          <button
            onClick={handleAddToCart}
            disabled={isInCart}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              isInCart
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-sm hover:shadow-md"
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
            <span>{isInCart ? "Đã thêm" : "Thêm vào giỏ"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}