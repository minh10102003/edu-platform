"use client"

import { useState, useEffect, useMemo } from "react"
import ProductCard from "../components/product/ProductCard.jsx"
import ProductModal from "../components/product/ProductModal.jsx"
import { api } from "../services/api.js"
import ChatbotAI from "../components/product/ChatbotAI.jsx"
import AISuggestions from "../components/product/AISuggestions.jsx"
import { storage } from "../utils/storage.js"

// Từ điển mapping tiếng Việt sang tiếng Anh cho search
const vietnameseToEnglishMap = {
  "tiếng anh": "english",
  "anh ngữ": "english",
  "kinh doanh": "business",
  "lập trình": "programming",
  "thiết kế": "design",
  "nghệ thuật": "art",
  "âm nhạc": "music",
  "nhiếp ảnh": "photography",
  "tiếp thị": "marketing",
  "tài chính": "finance",
  "sức khỏe": "health",
  "code": "programming",
  "phần mềm": "programming",
  "ứng dụng": "programming",
  "đồ họa": "design",
  "giao diện": "design",
  "logo": "design",
  "poster": "design",
  "vẽ tranh": "art",
  "sáng tạo": "art",
  "đồ thủ công": "art",
  "nhạc cụ": "music",
  "guitar": "music",
  "piano": "music",
  "violin": "music",
  "chụp ảnh": "photography",
  "máy ảnh": "photography",
  "quảng cáo": "marketing",
  "dinh dưỡng": "health",
  "yoga": "health",
  "thiền": "health",
  "đầu tư": "finance",
  "kế toán": "finance"
}

export default function HomePage({ onRefreshCounts }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("default")
  const [showChatbot, setShowChatbot] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  
  // Price filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000000 })
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 2000000 })
  const [showPriceFilter, setShowPriceFilter] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Calculate price bounds from products
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 2000000 }
    const prices = products.map(p => p.price)
    return {
      min: Math.floor(Math.min(...prices) / 10000) * 10000,
      max: Math.ceil(Math.max(...prices) / 100000) * 100000
    }
  }, [products])

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

  // Update price range when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange(priceBounds)
      setTempPriceRange(priceBounds)
    }
  }, [priceBounds])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, sortOrder, priceRange])

  // Close price filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPriceFilter && !event.target.closest('.price-filter-container') && !event.target.closest('[data-price-dropdown]')) {
        setShowPriceFilter(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPriceFilter])

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
    storage.addToHistory(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  // Enhanced search function that supports Vietnamese keywords
  const matchesSearch = (product, searchTerm) => {
    if (!searchTerm) return true
    
    const lowerSearchTerm = searchTerm.toLowerCase()
    
    // Search in product name and description
    const matchesName = product.name.toLowerCase().includes(lowerSearchTerm)
    const matchesDescription = product.shortDescription.toLowerCase().includes(lowerSearchTerm)
    
    // Search by Vietnamese keywords mapping to category
    const matchesVietnameseCategory = Object.entries(vietnameseToEnglishMap).some(([vietnamese, english]) => {
      return lowerSearchTerm.includes(vietnamese) && product.category.toLowerCase() === english
    })
    
    // Search by English category directly
    const matchesEnglishCategory = product.category.toLowerCase().includes(lowerSearchTerm)
    
    return matchesName || matchesDescription || matchesVietnameseCategory || matchesEnglishCategory
  }

  const filteredProducts = products
    .filter((product) => {
      const searchMatch = matchesSearch(product, searchTerm)
      const categoryMatch = categoryFilter === "all" || product.category.toLowerCase() === categoryFilter.toLowerCase()
      const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max
      return searchMatch && categoryMatch && priceMatch
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "rating-desc":
          return b.rating - a.rating
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  const categories = ["all", ...new Set(products.map((p) => p.category))]

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setSortOrder("default")
    setPriceRange(priceBounds)
    setTempPriceRange(priceBounds)
    setCurrentPage(1)
  }

  // Price filter handlers
  const handlePriceRangeChange = (type, value) => {
    const numValue = parseInt(value)
    if (!isNaN(numValue)) {
      setTempPriceRange(prev => ({
        ...prev,
        [type]: Math.max(priceBounds.min, Math.min(priceBounds.max, numValue))
      }))
    }
  }

  const applyPriceFilter = () => {
    setPriceRange({
      min: Math.min(tempPriceRange.min, tempPriceRange.max),
      max: Math.max(tempPriceRange.min, tempPriceRange.max)
    })
    setShowPriceFilter(false)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  // Pagination handlers
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải khóa học...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Có lỗi xảy ra</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                Khám phá các{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  khóa học
                </span>{" "}
                tuyệt vời
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in-up animation-delay-200">
                Nâng cao kỹ năng và kiến thức của bạn với hàng nghìn khóa học chất lượng từ các chuyên gia hàng đầu
              </p>
              <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Chứng chỉ hoàn thành</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Học trọn đời</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>

            {/* Enhanced Filters and Search */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in relative z-50">
              {/* First Row - Search and Main Filters */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-6">
                {/* Enhanced Search Bar */}
                <div className="w-full lg:w-2/5 relative">
                  <input
                    type="text"
                    placeholder="Tìm kiếm khóa học... (VD: lập trình, tiếng anh, thiết kế)"
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="w-full lg:w-1/5">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700"
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

                {/* Price Filter Button */}
                <div className="w-full lg:w-auto relative price-filter-container z-50">
                  <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className={`w-full lg:w-auto px-4 py-3 border rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                      priceRange.min !== priceBounds.min || priceRange.max !== priceBounds.max
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Giá tiền
                    <svg className={`w-4 h-4 transition-transform ${showPriceFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Price Filter Dropdown - FIXED VERSION */}
                  {showPriceFilter && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 w-80 max-w-[90vw] z-[9999]" data-price-dropdown>
                      <h4 className="font-semibold text-gray-900 mb-3">Khoảng giá</h4>
                      
                      {/* Price Range Inputs */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Giá từ</label>
                          <input
                            type="number"
                            value={tempPriceRange.min}
                            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min={priceBounds.min}
                            max={priceBounds.max}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Giá đến</label>
                          <input
                            type="number"
                            value={tempPriceRange.max}
                            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            min={priceBounds.min}
                            max={priceBounds.max}
                          />
                        </div>
                      </div>

                      {/* Price Range Sliders - COMPLETELY REWRITTEN */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Kéo để chọn khoảng giá
                        </label>
                        
                        {/* Slider Container */}
                        <div className="relative h-12 px-1">
                          {/* Background Track */}
                          <div className="absolute top-1/2 left-1 right-1 h-2 -translate-y-1/2 bg-gray-200 rounded-full"></div>
                          
                          {/* Active Range Track */}
                          <div 
                            className="absolute top-1/2 h-2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            style={{
                              left: `${((tempPriceRange.min - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100}%`,
                              width: `${((tempPriceRange.max - tempPriceRange.min) / (priceBounds.max - priceBounds.min)) * 100}%`
                            }}
                          />
                          
                          {/* Min Range Slider */}
                          <input
                            type="range"
                            min={priceBounds.min}
                            max={priceBounds.max}
                            value={tempPriceRange.min}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value <= tempPriceRange.max) {
                                handlePriceRangeChange('min', e.target.value);
                              }
                            }}
                            className="fixed-price-range-slider min-slider"
                            style={{ zIndex: tempPriceRange.min > priceBounds.max - 100000 ? 25 : 20 }}
                          />
                          
                          {/* Max Range Slider */}
                          <input
                            type="range"
                            min={priceBounds.min}
                            max={priceBounds.max}
                            value={tempPriceRange.max}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value >= tempPriceRange.min) {
                                handlePriceRangeChange('max', e.target.value);
                              }
                            }}
                            className="fixed-price-range-slider max-slider"
                            style={{ zIndex: tempPriceRange.max < priceBounds.min + 100000 ? 25 : 15 }}
                          />
                          

                        </div>
                        
                        {/* Bounds Display */}
                        <div className="flex justify-between text-xs text-gray-500 mt-4 px-1">
                          <span>{formatPrice(priceBounds.min)}</span>
                          <span>{formatPrice(priceBounds.max)}</span>
                        </div>
                      </div>

                      {/* Current Range Display */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-blue-800 font-medium">
                          Khoảng giá đã chọn: {formatPrice(Math.min(tempPriceRange.min, tempPriceRange.max))} - {formatPrice(Math.max(tempPriceRange.min, tempPriceRange.max))}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={applyPriceFilter}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Áp dụng
                        </button>
                        <button
                          onClick={() => {
                            setTempPriceRange(priceBounds)
                            setPriceRange(priceBounds)
                            setShowPriceFilter(false)
                          }}
                          className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Đặt lại
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort Order */}
                <div className="w-full lg:w-1/5">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="default">Mặc định</option>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                    <option value="price-asc">Giá thấp đến cao</option>
                    <option value="price-desc">Giá cao đến thấp</option>
                    <option value="rating-desc">Đánh giá cao nhất</option>
                  </select>
                </div>
              </div>

              {/* Second Row - Additional Controls */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Items per page */}
                <div className="w-full lg:w-auto">
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700"
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                  >
                    <option value={6}>6 / trang</option>
                    <option value={12}>12 / trang</option>
                    <option value={18}>18 / trang</option>
                    <option value={24}>24 / trang</option>
                  </select>
                </div>

                {/* Active Filters Display */}
                <div className="flex flex-wrap gap-2 flex-1">
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Tìm kiếm: "{searchTerm}"
                      <button onClick={() => setSearchTerm("")} className="hover:text-blue-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {categoryFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Danh mục: {capitalize(categoryFilter)}
                      <button onClick={() => setCategoryFilter("all")} className="hover:text-green-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {(priceRange.min !== priceBounds.min || priceRange.max !== priceBounds.max) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Giá: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                      <button onClick={() => setPriceRange(priceBounds)} className="hover:text-purple-600">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="Grid view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600"
                    }`}
                    aria-label="List view"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>

                {/* Clear All Filters */}
                {(searchTerm || categoryFilter !== "all" || sortOrder !== "default" || priceRange.min !== priceBounds.min || priceRange.max !== priceBounds.max) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 whitespace-nowrap"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* Results Count and Pagination Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Hiển thị <span className="font-semibold">{startIndex + 1}</span> - <span className="font-semibold">{Math.min(endIndex, filteredProducts.length)}</span> của <span className="font-semibold">{filteredProducts.length}</span> khóa học
                {searchTerm && (
                  <span>
                    {" "}
                    cho "<span className="font-semibold">{searchTerm}</span>"
                  </span>
                )}
              </p>
              {totalPages > 1 && (
                <p className="text-gray-500 text-sm">
                  Trang {currentPage} / {totalPages}
                </p>
              )}
            </div>

            {/* Product Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg p-8 max-w-md mx-auto shadow-sm">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Không tìm thấy khóa học nào</h3>
                  <p className="text-gray-600 mb-4">Thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác</p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Xóa tất cả bộ lọc
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={`${
                  viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                } animate-stagger mb-8`}>
                  {currentProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetail={handleViewDetail}
                      onRefreshCounts={onRefreshCounts}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 py-8">
                    {/* Previous Button */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((pageNumber, index) => (
                      <button
                        key={index}
                        onClick={() => typeof pageNumber === 'number' && goToPage(pageNumber)}
                        disabled={pageNumber === '...'}
                        className={`px-3 py-2 min-w-[2.5rem] rounded-lg transition-all duration-200 ${
                          pageNumber === currentPage
                            ? "bg-blue-600 text-white"
                            : pageNumber === '...'
                            ? "text-gray-400 cursor-default"
                            : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - AI Suggestions */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-8">
              <AISuggestions 
                onProductClick={handleViewDetail}
                className="mb-6"
              />
            </div>
          </div>
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={handleCloseModal} 
            onRefreshCounts={onRefreshCounts} 
          />
        )}

        {/* Floating Chatbot Button */}
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 left-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-300 z-40 group"
          aria-label="Mở trợ lý AI"
        >
          <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>

        {/* AI Chatbot */}
        <ChatbotAI 
          isOpen={showChatbot}
          onClose={() => setShowChatbot(false)} 
          onProductClick={handleViewDetail} 
        />
      </div>

      {/* Custom CSS for FIXED price range sliders */}
      <style>{`
        /* Fixed Price Range Slider Styles */
        .fixed-price-range-slider {
          position: absolute;
          width: calc(100% - 8px);
          height: 48px;
          top: 0;
          left: 4px;
          background: transparent;
          -webkit-appearance: none;
          appearance: none;
          cursor: pointer;
          pointer-events: none;
        }

        .fixed-price-range-slider::-webkit-slider-track {
          height: 8px;
          background: transparent;
          border: none;
          border-radius: 4px;
        }

        .fixed-price-range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #3B82F6;
          cursor: pointer;
          pointer-events: auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          position: relative;
          top: 50%;
          transform: translateY(-50%);
        }

        .fixed-price-range-slider::-webkit-slider-thumb:hover {
          border-color: #2563EB;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-50%) scale(1.1);
        }

        .fixed-price-range-slider::-webkit-slider-thumb:active {
          border-color: #1D4ED8;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transform: translateY(-50%) scale(0.95);
        }

        /* Firefox styles */
        .fixed-price-range-slider::-moz-range-track {
          height: 8px;
          background: transparent;
          border: none;
          border-radius: 4px;
        }

        .fixed-price-range-slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #3B82F6;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .fixed-price-range-slider::-moz-range-thumb:hover {
          border-color: #2563EB;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          transform: scale(1.1);
        }

        .fixed-price-range-slider:focus {
          outline: none;
        }

        .fixed-price-range-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }

        .fixed-price-range-slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
        }

        /* Ensure proper layering */
        .min-slider {
          z-index: 20;
        }

        .max-slider {
          z-index: 15;
        }

        /* When sliders are close to edges, adjust z-index */
        .min-slider[style*="z-index: 25"] {
          z-index: 25 !important;
        }

        .max-slider[style*="z-index: 25"] {
          z-index: 25 !important;
        }
      `}</style>
    </div>
  )
}

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)