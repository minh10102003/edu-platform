"use client"

import { useState, useEffect, useMemo } from "react"
import { storage } from "../utils/storage.js"
import ProductCard from "../components/product/ProductCard.jsx"
import ProductModal from "../components/product/ProductModal.jsx"
import { api } from "../services/api.js"

export default function FavoritesPage({ onRefreshCounts }) {
  const [favoriteProductIds, setFavoriteProductIds] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [sortOrder, setSortOrder] = useState("default") // 'default', 'price-asc', 'price-desc', 'rating-desc'
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // States for inline confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState("")
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState(() => () => {})

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const productsData = await api.getProducts()
        setAllProducts(productsData.data)
        setFavoriteProductIds(storage.getFavorites())
      } catch (err) {
        setError("Không thể tải sản phẩm. Vui lòng thử lại sau.")
        console.error("Error fetching all products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllProducts()
  }, [])

  const favoriteProducts = useMemo(() => {
    return allProducts.filter((product) => favoriteProductIds.includes(product.id))
  }, [allProducts, favoriteProductIds])

  const handleToggleFavorite = (productId, isFavorite) => {
    if (!isFavorite) {
      setFavoriteProductIds((prev) => prev.filter((id) => id !== productId))
    } else {
      setFavoriteProductIds((prev) => [...prev, productId])
    }
    onRefreshCounts()
  }

  const handleClearFavoritesClick = () => {
    setConfirmTitle("Xác nhận xóa yêu thích")
    setConfirmMessage("Bạn có chắc chắn muốn xóa toàn bộ danh sách yêu thích không?")
    setConfirmAction(() => () => {
      const clearedFavorites = storage.clearFavorites()
      setFavoriteProductIds(clearedFavorites)
      showToast("Đã xóa toàn bộ danh sách yêu thích", "success")
      onRefreshCounts()
      setShowConfirmDialog(false)
    })
    setShowConfirmDialog(true)
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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
      </svg>
      ${message}
    `
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const filteredAndSortedFavorites = useMemo(() => {
    const filtered = favoriteProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesCategory
    })

    if (sortOrder === "price-asc") {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortOrder === "price-desc") {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortOrder === "rating-desc") {
      filtered.sort((a, b) => b.rating - a.rating)
    }
    return filtered
  }, [favoriteProducts, searchTerm, categoryFilter, sortOrder])

  const categories = useMemo(() => {
    return ["all", ...new Set(allProducts.map((p) => p.category))]
  }, [allProducts])

  const totalFavorites = favoriteProducts.length
  const totalPrice = favoriteProducts.reduce((sum, p) => sum + p.price, 0)
  const avgRating =
    favoriteProducts.length > 0
      ? (favoriteProducts.reduce((sum, p) => sum + p.rating, 0) / favoriteProducts.length).toFixed(1)
      : "N/A"

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
        Khóa học yêu thích của bạn
      </h1>

      {favoriteProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-600 text-lg">
          Bạn chưa có khóa học yêu thích nào. Hãy khám phá và thêm vào nhé!
        </div>
      ) : (
        <>
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
              <p className="text-sm opacity-80 mb-1">Tổng số khóa học</p>
              <p className="text-4xl font-bold">{totalFavorites}</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
              <p className="text-sm text-gray-600 mb-1">Tổng giá trị</p>
              <p className="text-3xl font-bold text-blue-600">
                {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center transform hover:scale-105 transition-transform duration-300">
              <p className="text-sm text-gray-600 mb-1">Đánh giá trung bình</p>
              <p className="text-3xl font-bold text-yellow-500">{avgRating} ★</p>
            </div>
          </div>

          {/* Filters, Sort & View Mode */}
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

            <div className="w-full md:w-1/3 flex items-center gap-4">
              <select
                className="flex-grow px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="default">Sắp xếp mặc định</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating-desc">Đánh giá: Cao nhất</option>
              </select>
              <div className="flex-shrink-0 flex space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label="Grid View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  aria-label="List View"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Clear Favorites Button */}
          <div className="mb-6 text-right">
            <button
              onClick={handleClearFavoritesClick}
              className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Xóa toàn bộ yêu thích
            </button>
          </div>

          {/* Product Display */}
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "grid grid-cols-1 gap-6"
            }
          >
            {filteredAndSortedFavorites.map((product) =>
              viewMode === "grid" ? (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={handleViewDetail}
                  onToggleFavorite={handleToggleFavorite}
                  onRefreshCounts={onRefreshCounts}
                />
              ) : (
                <div
                  key={product.id}
                  className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative w-full md:w-1/3 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={`/images/${product.category.toLowerCase()}.jpg` || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${getCategoryColor(
                          product.category,
                        )}`}
                      >
                        {capitalize(product.category)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleFavorite(product.id, !storage.isFavorite(product.id))
                      }}
                      className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                        storage.isFavorite(product.id)
                          ? "bg-red-500 text-white shadow-lg"
                          : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500"
                      }`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill={storage.isFavorite(product.id) ? "currentColor" : "none"}
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
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
                        {product.shortDescription}
                      </p>
                      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          <span className="font-medium">{product.instructor}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{product.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          <span className="font-semibold text-sm text-gray-900">{product.rating}</span>
                          <span className="text-gray-400 text-xs">({product.reviews})</span>
                        </div>
                        {getLevelIcon(product.level)}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                        </span>
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="mt-2 px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="whitespace-nowrap">Xem chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </>
      )}

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} onRefreshCounts={onRefreshCounts} />
      )}

      {/* Inline Confirm Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm transform scale-95 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{confirmTitle}</h3>
            <p className="text-gray-700 mb-6">{confirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmAction}
                className="px-5 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

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
