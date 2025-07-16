"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "../context/TranslationContext.jsx"
import i18n from "../utils/i18n.js"
import { storage } from "../utils/storage.js"
import ProductCard from "../components/product/ProductCard.jsx"
import ProductModal from "../components/product/ProductModal.jsx"
import { api } from "../services/api.js"

const createToast = (message, type = "default") => {
  const toast = document.createElement("div")
  const icon = type === "success" ? "✓" : type === "error" ? "⚠" : type === "info" ? "ℹ" : "✓"
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

export default function FavoritesPage({ onRefreshCounts }) {
  const { t, currentLanguage: langFromCtx } = useTranslation()
  const currentLanguage = langFromCtx || i18n.getCurrentLanguage()
  const [favoriteProductIds, setFavoriteProductIds] = useState([])
  const [allProducts, setAllProducts]         = useState([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [viewMode, setViewMode]               = useState("grid")
  const [sortOrder, setSortOrder]             = useState("default")
  const [categoryFilter, setCategoryFilter]   = useState("all")
  const [searchTerm, setSearchTerm]           = useState("")

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmTitle, setConfirmTitle]           = useState("")
  const [confirmMessage, setConfirmMessage]       = useState("")
  const [confirmAction, setConfirmAction]         = useState(() => () => {})

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true)
        const productsData = await api.getProducts()
        setAllProducts(productsData.data)
        setFavoriteProductIds(storage.getFavorites())
      } catch (err) {
        setError(t("errorLoadingFavorites"))
        console.error("Error fetching all products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAllProducts()
  }, [t])

  const favoriteProducts = useMemo(() => {
    return allProducts.filter(p => favoriteProductIds.includes(p.id))
  }, [allProducts, favoriteProductIds])

  const handleClearFavoritesClick = () => {
    setConfirmTitle(t("confirmClearFavoritesTitle"))
    setConfirmMessage(t("confirmClearFavoritesMessage"))
    setConfirmAction(() => () => {
      storage.clearFavorites()
      setFavoriteProductIds([])
      createToast(t("toastClearedFavorites"), "success")
      onRefreshCounts()
      setShowConfirmDialog(false)
    })
    setShowConfirmDialog(true)
  }

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  const handleAddAllToCart = () => {
    let addedCount = 0
    favoriteProducts.forEach(p => {
      if (!storage.isInCart(p.id)) {
        storage.addToCart(p)
        addedCount++
      }
    })

    if (addedCount > 0) {
      createToast(t("toastAddedToCartCount", { count: addedCount }), "success")
      onRefreshCounts()
    } else {
      createToast(t("toastAllInCart"), "info")
    }
  }

  const filteredAndSortedFavorites = useMemo(() => {
    const filtered = favoriteProducts.filter((p) => {
      const matchesSearch   = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                               p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" ||
                              p.category.toLowerCase() === categoryFilter.toLowerCase()
      return matchesSearch && matchesCategory
    })

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOrder) {
        case "price-asc":  return a.price - b.price
        case "price-desc": return b.price - a.price
        case "rating-desc":return b.rating - a.rating
        case "name-asc":   return a.name.localeCompare(b.name)
        case "newest":     return b.id - a.id
        default:           return 0
      }
    })

    return sorted
  }, [favoriteProducts, searchTerm, categoryFilter, sortOrder])

  const categories = useMemo(() => ["all", ...new Set(allProducts.map(p => p.category))], [allProducts])

  const totalFavorites = favoriteProducts.length
  const totalPrice     = favoriteProducts.reduce((sum, p) => sum + p.price, 0)
  const avgRating      = totalFavorites > 0
    ? (favoriteProducts.reduce((s, p) => s + p.rating, 0) / totalFavorites).toFixed(1)
    : "0"

  const EXCHANGE_RATE_VND_TO_USD = 0.000043  
  const formatPrice = (price) => {
    if (currentLanguage === "en") {
      const usd = price * EXCHANGE_RATE_VND_TO_USD
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(usd)
    } else {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
      }).format(price)
    }
  }
  

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setSortOrder("default")
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t("loadingFavorites")}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                   1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732
                   16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">{t("errorOccurred")}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in-up">
          {t("favoritesPageTitle")}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          {t("favoritesPageSubtitle")}
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682
                     a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318
                     a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t("emptyFavoritesTitle")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("emptyFavoritesText")}
            </p>
            <a
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block font-medium"
            >
              {t("exploreCourses")}
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682
                       a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318
                       a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{totalFavorites}</p>
              <p className="text-sm text-gray-600">{t("statsFavoritesCount")}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2
                       m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1
                       m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">{formatPrice(totalPrice)}</p>
              <p className="text-sm text-gray-600">{t("statsTotalValue")}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25
                           L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{avgRating} ★</p>
              <p className="text-sm text-gray-600">{t("statsAvgRating")}</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5
                       a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2
                       M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2
                       v2M7 7h10" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {new Set(favoriteProducts.map(p => p.category)).size}
              </p>
              <p className="text-sm text-gray-600">{t("statsUniqueCategories")}</p>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Search */}
              <div className="w-full lg:w-1/3 relative">
                <input
                  type="text"
                  placeholder={t("searchFavoritesPlaceholder")}
                  className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pl-12 text-gray-700"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter */}
              <div className="w-full lg:w-1/4">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? t("allCategories") : capitalize(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div className="w-full lg:w-1/4">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="default">{t("default")}</option>
                  <option value="newest">{t("newest")}</option>
                  <option value="name-asc">{t("nameAsc")}</option>
                  <option value="price-asc">{t("priceAsc")}</option>
                  <option value="price-desc">{t("priceDesc")}</option>
                  <option value="rating-desc">{t("ratingDesc")}</option>
                </select>
              </div>

              {/* View Mode & Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  aria-label={t("gridView")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2
                         0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2
                         0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2
                         0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2
                         0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0
                         01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  aria-label={t("listView")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {t("favoritesStatsDisplay", {
                    count: filteredAndSortedFavorites.length,
                    total: totalFavorites
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {(searchTerm || categoryFilter !== "all" || sortOrder !== "default") && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    {t("clearFilters")}
                  </button>
                )}
                
                <button
                  onClick={handleAddAllToCart}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                >
                  {t("addAllToCart")}
                </button>
                
                <button
                  onClick={handleClearFavoritesClick}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                >
                  {t("clearAllFavorites")}
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {filteredAndSortedFavorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6
                       m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1
                       0 01.707.293l5.414 5.414a1 1 0 01.293.707V19
                       a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("noResultsTitle")}</h3>
                <p className="text-gray-600 mb-4">{t("noResultsText")}</p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {t("clearFilters")}
                </button>
              </div>
            </div>
          ) : (
            <div className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            } animate-stagger`}>
              {filteredAndSortedFavorites.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={handleViewDetail}
                  onRefreshCounts={onRefreshCounts}
                  viewMode={viewMode}
                  formatPrice={formatPrice}
                  currentLanguage={currentLanguage}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={handleCloseModal} 
          onRefreshCounts={onRefreshCounts} 
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{confirmTitle}</h3>
            <p className="text-gray-700 mb-6">{confirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={confirmAction}
                className="px-5 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                {t("OK")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
