"use client"

import { useState, useEffect, useRef } from "react"
import { storage } from "../../utils/storage.js"
import { useTranslation } from "../../context/TranslationContext.jsx"
import i18n from "../../utils/i18n.js"

const VND_TO_USD_RATE = 23000

const createToast = (message, type = "default") => {
  const toast = document.createElement("div")
  const icon =
    type === "success"
      ? "✓"
      : type === "error"
      ? "⚠"
      : type === "info"
      ? "ℹ"
      : "✓"
  const bgColor = {
    success: "bg-emerald-500",
    error:   "bg-red-500",
    info:    "bg-blue-500",
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

export default function ProductModal({ product, onClose, onRefreshCounts }) {
  const { t, currentLanguage: langFromCtx } = useTranslation()
  const currentLanguage = langFromCtx || i18n.getCurrentLanguage()

  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart]       = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError]   = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    if (product) {
      setIsFavorite(storage.isFavorite(product.id))
      setIsInCart(storage.isInCart(product.id))
    }
  }, [product])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose()
    }
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    document.addEventListener("mousedown", handleClickOutside)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [onClose])

  const handleToggleFavorite = () => {
    if (!product) return
    try {
      if (isFavorite) {
        storage.removeFavorite(product.id)
        createToast(t("toastRemovedFromFavorites"), "info")
      } else {
        storage.addFavorite(product.id)
        createToast(t("toastAddedToFavoritesSingle"), "success")
      }
      setIsFavorite(!isFavorite)
      onRefreshCounts?.()
    } catch {
      createToast(t("error"), "error")
    }
  }

  const handleAddToCart = () => {
    if (!product || isInCart) return
    try {
      storage.addToCart(product)
      setIsInCart(true)
      createToast(t("toastAddedToCartSingle"), "success")
      onRefreshCounts?.()
    } catch {
      createToast(t("error"), "error")
    }
  }

  const formatPrice = (priceVnd) => {
    if (currentLanguage === "en") {
      const priceUsd = priceVnd / VND_TO_USD_RATE
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(priceUsd)
    } else {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
      }).format(priceVnd)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      art:         "bg-pink-50 text-pink-700 border-pink-200",
      business:    "bg-blue-50 text-blue-700 border-blue-200",
      design:      "bg-purple-50 text-purple-700 border-purple-200",
      music:       "bg-green-50 text-green-700 border-green-200",
      programming: "bg-orange-50 text-orange-700 border-orange-200",
      photography: "bg-indigo-50 text-indigo-700 border-indigo-200",
      marketing:   "bg-red-50 text-red-700 border-red-200",
      english:     "bg-yellow-50 text-yellow-700 border-yellow-200",
      finance:     "bg-emerald-50 text-emerald-700 border-emerald-200",
      health:      "bg-teal-50 text-teal-700 border-teal-200",
    }
    return colors[category?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const getLevelBadge = (level) => {
    const levelConfig = {
      beginner:     { color: "text-green-600", bg: "bg-green-50", dots: 1, label: t("levelBeginner") },
      intermediate: { color: "text-amber-600", bg: "bg-amber-50", dots: 2, label: t("levelIntermediate") },
      advanced:     { color: "text-red-600",   bg: "bg-red-50",   dots: 3, label: t("levelAdvanced") }
    }
    const config = levelConfig[level?.toLowerCase()] || levelConfig.beginner
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg}`}>
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < config.dots ? config.color.replace("text-", "bg-") : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
    )
  }

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12
                 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))

  if (!product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl sm:max-w-4xl flex flex-col lg:flex-row overflow-hidden animate-scale-in max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/90 text-gray-600 hover:bg-white hover:text-gray-800 transition-all duration-200 z-10 shadow-md hover:shadow-lg"
          aria-label={t("close")}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Product Image */}
        <div className="relative w-full lg:w-1/2 h-64 sm:h-80 lg:h-auto flex-shrink-0 overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586
                         a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6
                         a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <img
            src={
              imageError
                ? "/placeholder.svg?height=500&width=600"
                : `/images/${product.category?.toLowerCase()}.jpg`
            }
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur-sm ${
                getCategoryColor(product.category)
              }`}
            >
              {product.category}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:w-1/2 p-8 flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                  <span className="font-semibold text-gray-900 ml-1">{product.rating}</span>
                  <span className="text-gray-500 text-sm">
                    ({product.reviews} {t("reviews")})
                  </span>
                </div>
                {getLevelBadge(product.level)}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("courseDescription")}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.fullDescription || product.shortDescription}
              </p>
            </div>

            {/* Course Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("courseDetails")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14
                               a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("instructor")}</p>
                    <p className="font-medium text-gray-900">{product.instructor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("duration")}</p>
                    <p className="font-medium text-gray-900">{product.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2
                               V5a2 2 0 012-2h5.586a1 1 0
                               01.707.293l5.414 5.414a1 1 0
                               01.293.707V19a2 2 0
                               01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("language")}</p>
                    <p className="font-medium text-gray-900">{product.language}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477
                               9.246 5 7.5 5S4.168 5.477
                               3 6.253v13C4.168 18.477
                               5.754 18 7.5 18s3.332.477
                               4.5 1.253m0-13C13.168
                               5.477 14.754 5 16.5 5c1.746 0
                               3.332.477 4.5 1.253v13C19.832
                               18.477 18.246 18 16.5 18c-1.746
                               0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t("certificate")}</p>
                    <p className="font-medium text-gray-900">{t("yes")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("whatYouWillLearn")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{t("learnOutcome1")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{t("learnOutcome2")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{t("learnOutcome3")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{t("learnOutcome4")}</span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("requirements")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{t("requirement1")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{t("requirement2")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{t("requirement3")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
              <div>
                <span className="text-3xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  {t("lifetimeAccess")}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleFavorite}
                  className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                    isFavorite
                      ? "bg-red-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500"
                  }`}
                  aria-label={
                    isFavorite
                      ? t("removeFromFavorites")
                      : t("addToFavorites")
                  }
                >
                  <svg
                    className="w-6 h-6"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12
                             20.364l7.682-7.682a4.5 4.5 0
                             00-6.364-6.364L12 7.636l-1.318
                             -1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isInCart}
                  className={`px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                    isInCart
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                  }`}
                >
                  {isInCart ? t("addedToCart") : t("addToCart")}
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9
                           9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t("refund30Days")}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9
                           9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t("lifetimeAccess")}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832
                           5.477 9.246 5 7.5 5S4.168
                           5.477 3 6.253v13C4.168
                           18.477 5.754 18 7.5 18s3.332
                           .477 4.5 1.253m0-13C13.168
                           5.477 14.754 5 16.5 5c1.746
                           0 3.332.477 4.5 1.253v13
                           C19.832 18.477 18.246 18
                           16.5 18c-1.746 0-3.332.477
                           -4.5 1.253" />
                </svg>
                <span>{t("certificateOfCompletion")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
