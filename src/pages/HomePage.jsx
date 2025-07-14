"use client"

import { useState, useEffect } from "react"
import ProductCard from "../components/product/ProductCard.jsx"
import ProductModal from "../components/product/ProductModal.jsx"
import { api } from "../services/api.js" // Added .js
import ChatbotAI from "../components/product/ChatbotAI.jsx"
import AISuggestions from "../components/product/AISuggestions.jsx"
import { storage } from "../utils/storage.js" // Import storage

export default function HomePage({ onRefreshCounts }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("default") // 'default', 'price-asc', 'price-desc', 'rating-desc'
  const [showChatbot, setShowChatbot] = useState(false)
  const [showAISuggestions, setShowAISuggestions] = useState(false)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await api.getProducts()
        setProducts(data.data)
      } catch (err) {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.")
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
    storage.addToHistory(product) // Add product to history when viewed
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleToggleFavorite = (productId, isFavorite) => {
    // This function is passed to ProductCard and handles the state update there.
    // The onRefreshCounts will handle the badge update.
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortOrder === "price-asc") {
        return a.price - b.price
      }
      if (sortOrder === "price-desc") {
        return b.price - a.price
      }
      if (sortOrder === "rating-desc") {
        return b.rating - a.rating
      }
      return 0 // default order
    })

  const categories = ["all", ...new Set(products.map((p) => p.category))]

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-red-600 text-lg">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center animate-fade-in-up">
        Khám phá các khóa học
      </h1>

      {/* Filters and Sort */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in">
        <div className="w-full md:w-1/3 relative">
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="w-full md:w-1/3">
          <select
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "Tất cả danh mục" : capitalize(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/3">
          <select
            className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="default">Sắp xếp mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating-desc">Đánh giá: Cao nhất</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetail={handleViewDetail}
            onToggleFavorite={handleToggleFavorite}
            onRefreshCounts={onRefreshCounts} // Pass the refresh function
          />
        ))}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} onRefreshCounts={onRefreshCounts} />
      )}

      {/* AI Chatbot Button */}
      <button
        onClick={() => setShowChatbot(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-40 flex items-center justify-center group whitespace-nowrap"
        aria-label="Open AI Chatbot"
      >
        <svg className="w-7 h-7 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
        {/* <span className="ml-2">Trợ lý AI</span> */} {/* Example if text is added later */}
      </button>

      {/* AI Suggestions Button */}
      <button
        onClick={() => setShowAISuggestions(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 z-40 flex items-center justify-center group whitespace-nowrap"
        aria-label="Open AI Suggestions"
      >
        <svg className="w-7 h-7 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m15.364 4.364l-.707-.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        {/* <span className="ml-2">Gợi ý AI</span> */} {/* Example if text is added later */}
      </button>

      {/* Chatbot AI Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ChatbotAI onClose={() => setShowChatbot(false)} onProductClick={handleViewDetail} />
        </div>
      )}

      {/* AI Suggestions Modal */}
      {showAISuggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <AISuggestions onClose={() => setShowAISuggestions(false)} onProductClick={handleViewDetail} />
        </div>
      )}
    </div>
  )
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
