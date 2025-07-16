"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslation } from "../context/TranslationContext.jsx"
import i18n from "../utils/i18n.js"
import { storage } from "../utils/storage.js"
import ProductCard from "../components/product/ProductCard.jsx"
import ProductModal from "../components/product/ProductModal.jsx"

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

export default function HistoryPage({ onRefreshCounts }) {
  const { t, currentLanguage: langFromCtx } = useTranslation()
  const currentLanguage = langFromCtx || i18n.getCurrentLanguage()

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

  const [viewHistory, setViewHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [viewMode, setViewMode] = useState("grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState("")
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState(() => () => {})

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        setViewHistory(storage.getHistory())
      } catch (err) {
        setError(t("errorLoadingHistory"))
        console.error("Error fetching history data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [t])

  const filteredAndSortedViewHistory = useMemo(() => {
    const now = Date.now()
    return viewHistory
      .filter(item => {
        const nameDesc =
          item.product.name.toLowerCase() +
          " " +
          item.product.shortDescription.toLowerCase()
        const matchesSearch = nameDesc.includes(searchTerm.toLowerCase())
        const matchesCategory =
          categoryFilter === "all"
            ? true
            : item.product.category.toLowerCase() ===
              categoryFilter.toLowerCase()

        let matchesDate = true
        if (dateFilter !== "all") {
          const viewDate = new Date(item.lastViewed).getTime()
          if (dateFilter === "last-7-days")
            matchesDate = viewDate >= now - 7 * 24 * 60 * 60 * 1000
          if (dateFilter === "last-30-days")
            matchesDate = viewDate >= now - 30 * 24 * 60 * 60 * 1000
          if (dateFilter === "this-year") {
            const d = new Date(item.lastViewed)
            matchesDate = d.getFullYear() === new Date().getFullYear()
          }
        }
        return matchesSearch && matchesCategory && matchesDate
      })
      .sort((a, b) => b.lastViewed - a.lastViewed)
  }, [viewHistory, searchTerm, categoryFilter, dateFilter])

  const handleViewDetail = p => setSelectedProduct(p)
  const handleCloseModal = () => setSelectedProduct(null)

  const handleClearHistoryClick = () => {
    setConfirmTitle(t("confirmClearHistoryTitle"))
    setConfirmMessage(t("confirmClearHistoryMessage"))
    setConfirmAction(() => () => {
      storage.clearHistory()
      setViewHistory([])
      createToast(t("toastClearedHistory"), "success")
      setShowConfirmDialog(false)
    })
    setShowConfirmDialog(true)
  }

  const handleAddAllToFavorites = () => {
    let addedCount = 0
    filteredAndSortedViewHistory.forEach(item => {
      if (!storage.isFavorite(item.product.id)) {
        storage.addFavorite(item.product.id)
        addedCount++
      }
    })
    if (addedCount > 0) {
      createToast(
        t("toastAddedToFavorites", { count: addedCount }),
        "success"
      )
      onRefreshCounts()
    } else {
      createToast(t("toastAllInFavorites"), "info")
    }
  }

  const categories = useMemo(() => {
    const cats = [...new Set(viewHistory.map(i => i.product.category))]
    return ["all", ...cats]
  }, [viewHistory])

  const totalUniqueProductsViewed = new Set(
    viewHistory.map(i => i.product.id)
  ).size
  const totalViewsCount = viewHistory.reduce((s, i) => s + i.viewCount, 0)
  const totalViewTime = viewHistory.reduce(
    (s, i) => s + (i.totalViewTime || 0),
    0
  )

  const formatDuration = ms => {
    const sec = Math.floor(ms / 1000),
      min = Math.floor(sec / 60),
      hr = Math.floor(min / 60)
    if (currentLanguage === "en") {
      if (hr > 0) return `${hr}h ${min % 60}m`
      if (min > 0) return `${min}m ${sec % 60}s`
      return `${sec}s`
    } else {
      if (hr > 0) return `${hr} giờ ${min % 60} phút`
      if (min > 0) return `${min} phút ${sec % 60} giây`
      return `${sec} giây`
    }
  }

  const formatDate = ts =>
    new Date(ts).toLocaleDateString(currentLanguage === "en" ? "en-US" : "vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })

  const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)
  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setDateFilter("all")
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t("loadingHistory")}</p>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <svg
              className="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 
                   0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833
                   -1.964-.833-2.732 0L3.732 16.5c-.77.833.192
                   2.5 1.732 2.5z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {t("errorOccurred")}
            </h3>
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
          {t("historyPageTitle")}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
          {t("historyPageSubtitle")}
        </p>
      </div>

      {viewHistory.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 
                     0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {t("emptyHistoryTitle")}
            </h3>
            <p className="text-gray-600 mb-6">{t("emptyHistoryText")}</p>
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
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 
                       5.477 9.246 5 7.5 5S4.168 5.477 
                       3 6.253v13C4.168 18.477 5.754 18 
                       7.5 18s3.332.477 4.5 1.253m0-13C13.168 
                       5.477 14.754 5 16.5 5c1.746 0 3.332.477 
                       4.5 1.253v13C19.832 18.477 18.246 18 
                       16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {totalUniqueProductsViewed}
              </p>
              <p className="text-sm text-gray-600">
                {t("statsViewedCount")}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 
                       3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 
                       5 12 5c4.478 0 8.268 2.943 
                       9.542 7-1.274 4.057-5.064 
                       7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {totalViewsCount}
              </p>
              <p className="text-sm text-gray-600">
                {t("statsTotalViews")}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 
                       0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">
                {formatDuration(totalViewTime)}
              </p>
              <p className="text-sm text-gray-600">
                {t("statsViewTime")}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6
                       a2 2 0 01-2 2H5a2 2 0 01-2-2v-6
                       a2 2 0 012-2m14 0V9a2 2 0 00-2-2
                       M5 11V9a2 2 0 012-2m0 0V5a2 2 
                       0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {categories.length - 1}
              </p>
              <p className="text-sm text-gray-600">
                {t("statsUniqueCategories")}
              </p>
            </div>
          </div>

          {/* Filters & Controls */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 lg:flex-row lg:items-center lg:justify-between">
              {/* Search + Filters */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 
                         11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("searchHistoryPlaceholder")}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px]"
                >
                  <option value="all">{t("allCategories")}</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>
                      {capitalize(cat)}
                    </option>
                  ))}
                </select>

                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px]"
                >
                  <option value="all">{t("allTime")}</option>
                  <option value="last-7-days">{t("last7Days")}</option>
                  <option value="last-30-days">{t("last30Days")}</option>
                  <option value="this-year">{t("thisYear")}</option>
                </select>

                {(searchTerm || categoryFilter !== "all" || dateFilter !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                  >
                    {t("clearFilters")}
                  </button>
                )}
              </div>

              {/* View Mode & Actions */}
              <div className="flex items-center gap-3 mt-4 sm:mt-0">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    aria-label={t("gridView")}
                  >
                    {/* icon grid */}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 
                           0 012 2v2a2 2 0 01-2 2H6a2 
                           2 0 01-2-2V6zM14 6a2 2 0 
                           012-2h2a2 2 0 012 2v2a2 2 
                           0 01-2 2h-2a2 2 0 01-2-2V6zM4 
                           16a2 2 0 012-2h2a2 2 0 012 
                           2v2a2 2 0 01-2 2H6a2 2 0 
                           01-2-2v-2zM14 16a2 2 0 
                           012-2h2a2 2 0 012 2v2a2 2 
                           0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    aria-label={t("listView")}
                  >
                    {/* icon list */}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleAddAllToFavorites}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 
                         6.364L12 20.364l7.682-7.682a4.5 
                         4.5 0 00-6.364-6.364L12 7.636l-1.318
                         -1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {t("addAllToFavorites")}
                </button>

                <button
                  onClick={handleClearHistoryClick}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 inline mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 
                         0116.138 21H7.862a2 2 0 
                         01-1.995-1.858L5 7m5 4v6m4
                         -6v6m1-10V4a1 1 0 00-1-1h-4a1 
                         1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  {t("clearAllHistory")}
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              {t("resultsCount")} {filteredAndSortedViewHistory.length}{" "}
              {t("of")} {viewHistory.length} {t("courses")}
            </div>
          </div>

          {/* Content */}
          {filteredAndSortedViewHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
                <svg
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 
                       11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {t("noResultsTitle")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("noResultsText")}
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {t("clearFilters")}
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`animate-fade-in ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }`}
            >
              {filteredAndSortedViewHistory.map(item =>
                viewMode === "grid" ? (
                  <div
                    key={`${item.product.id}-${item.lastViewed}`}
                    className="group"
                  >
                    <ProductCard
                      product={item.product}
                      onViewDetail={handleViewDetail}
                      onRefreshCounts={onRefreshCounts}
                    />
                    <div className="mt-2 text-sm text-gray-500 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 
                               3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 
                               5 12 5c4.478 0 8.268 2.943 
                               9.542 7-1.274 4.057-5.064 
                               7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>
                          {item.viewCount} {t("viewsCountLabel")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {t("lastViewed")}: {formatDate(item.lastViewed)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={`${item.product.id}-${item.lastViewed}`}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className="cursor-pointer"
                        onClick={() => handleViewDetail(item.product)}
                      >
                        <img
                          src={`/images/${item.product.category
                            .toLowerCase()
                          }.jpg`}
                          alt={item.product.name}
                          onError={e =>
                            (e.currentTarget.src =
                              "/placeholder.svg?height=100&width=150")
                          }
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors truncate"
                          onClick={() => handleViewDetail(item.product)}
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {item.product.shortDescription}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 
                                   3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 
                                   5 12 5c4.478 0 8.268 2.943 
                                   9.542 7-1.274 4.057-5.064 
                                   7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span>
                              {item.viewCount} {t("viewsCountLabel")}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 
                                   11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>
                              {t("lastViewed")}: {formatDate(item.lastViewed)}
                            </span>
                          </div>

                          {item.totalViewTime && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              <span>
                                {t("statsViewTime")}:{" "}
                                {formatDuration(item.totalViewTime)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xl font-bold text-blue-600">
                          {formatPrice(item.product.price)}
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetail(item.product)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            {t("viewDetail")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={handleCloseModal} />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {confirmTitle}
            </h3>
            <p className="text-gray-600 mb-6">{confirmMessage}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
