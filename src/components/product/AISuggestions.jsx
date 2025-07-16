"use client"

import { useState, useEffect } from "react"
import { api } from "../../services/api.js"
import { storage } from "../../utils/storage.js"

const createToast = (message, type = "default") => {
  const toast = document.createElement("div")
  const icon = type === "success" ? "✓" : type === "error" ? "⚠" : type === "info" ? "ℹ" : "✓"
  const bgColor = {
    success: "bg-emerald-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    default: "bg-gray-800"
  }[type]

  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 max-w-sm animate-slide-down`
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

export default function AISuggestions({ onProductClick, className }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [reason, setReason] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async (retry = false) => {
    try {
      setLoading(true)
      setError(null)
      const userId = `user_${Date.now()}`
      storage.trackUserAction("get_suggestions", userId)
      const response = await api.getSuggestions(userId)
      setSuggestions(response.data)
      setReason(response.message)
      setConfidence(response.confidence)
      if (response.debug) console.log("🔍 AI Debug Info:", response.debug)
      setRetryCount(0)
    } catch (err) {
      console.error("AI Suggestions Error:", err)
      setError(err.message)
      if (retry && retryCount < 3) {
        const delayMs = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          setRetryCount((c) => c + 1)
          loadSuggestions(true)
        }, delayMs)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = (id) => {
    setSuggestions((s) => s.filter((p) => p.id !== id))
    createToast("Đã loại bỏ gợi ý", "info")
  }

  const getConfidenceColor = (c) => (c >= 0.8 ? "text-emerald-600" : c >= 0.6 ? "text-amber-600" : "text-gray-600")
  const getConfidenceBg = (c) => (c >= 0.8 ? "bg-emerald-50" : c >= 0.6 ? "bg-amber-50" : "bg-gray-50")
  const getConfidenceText = (c) => (c >= 0.8 ? "Rất phù hợp" : c >= 0.6 ? "Phù hợp" : "Có thể bạn thích")

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { 
      style: "currency", 
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (error && !loading) {
    return (
      <div className={`bg-white border border-red-200 rounded-xl shadow-lg p-6 w-full max-w-xs sm:max-w-md ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">Gợi ý AI</h3>
          </div>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {!isMinimized && (
          <div>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <div className="flex gap-2">
              <button
                onClick={() => loadSuggestions(true)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Thử lại {retryCount > 0 && `(${retryCount}/3)`}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m15.364 4.364l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Gợi ý AI thông minh
                {loading && (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                )}
              </h3>
              <p className="text-sm text-gray-600">{reason || "Dựa trên sở thích của bạn"}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${isMinimized ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {!isMinimized && confidence > 0 && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 ${getConfidenceBg(confidence)} rounded-full`}>
            <div className={`w-2 h-2 rounded-full ${confidence >= 0.8 ? 'bg-emerald-500' : confidence >= 0.6 ? 'bg-amber-500' : 'bg-gray-500'}`}></div>
            <span className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
              {getConfidenceText(confidence)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 h-32 rounded-lg mb-3"></div>
                  <div className="bg-gray-100 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-gray-100 h-3 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
              {suggestions.map((product, index) => (
                <div
                  key={product.id}
                  className="group border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
                  onClick={() => onProductClick(product)}
                >
                  {/* Header with title and dismiss button */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h4>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDismiss(product.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all flex-shrink-0"
                    >
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Content section */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <img
                        src={product.image || `/images/${product.category?.toLowerCase()}.jpg`}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=60&width=60"
                        }}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {product.shortDescription}
                      </p>
                      
                      {/* Meta info in vertical layout */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-600">{product.rating}</span>
                          </div>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            {product.category}
                          </span>
                        </div>
                        
                        {/* Price section - full width */}
                        <div className="pt-1">
                          <span className="text-sm font-semibold text-blue-600 block">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action hint */}
                  <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-center text-xs text-blue-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Nhấn để xem chi tiết
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Actions */}
          {!loading && suggestions.length > 0 && (
            <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => loadSuggestions()}
                className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </button>
            </div>
          )}
          
          {suggestions.length === 0 && !loading && !error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m15.364 4.364l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Chưa có gợi ý phù hợp</p>
              <button
                onClick={() => loadSuggestions()}
                className="mt-3 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}