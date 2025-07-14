import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import AISuggestions from '../components/product/AISuggestions';
import ProductCard from '../components/product/ProductCard';
import ChatbotAI from '../components/product/ChatbotAI';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const productMaxPrice = useMemo(
    () => (products.length ? Math.max(...products.map(p => p.price)) : 0),
    [products]
  );
  const categories = useMemo(
    () => ['all', ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  useEffect(() => {
    loadProducts();
    setFavorites(storage.getFavorites());
    setCartItemsCount(storage.getCartItemsCount());
  }, []);

  useEffect(() => {
    if (products.length) {
      setPriceMin(0);
      setPriceMax(productMaxPrice);
    }
  }, [products, productMaxPrice]);

  const loadProducts = async () => {
    try {
      const response = await api.getProducts();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q)
      );
    }

    filtered = filtered.filter(p => p.price >= priceMin && p.price <= priceMax);

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (ratingFilter === '4up') {
      filtered = filtered.filter(p => p.rating >= 4);
    } else if (ratingFilter === '3up') {
      filtered = filtered.filter(p => p.rating >= 3);
    }

    switch (sortOption) {
      case 'priceAsc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [
    searchQuery,
    priceMin,
    priceMax,
    categoryFilter,
    ratingFilter,
    sortOption,
    products
  ]);

  const handleToggleFavorite = (productId, isNowFav) => {
    setFavorites(prev =>
      isNowFav ? [...prev, productId] : prev.filter(id => id !== productId)
    );
  };

  const handleGetSuggestions = () => {
    setShowSuggestions(true);
    const btn = document.querySelector('.ai-button');
    if (btn) {
      btn.classList.add('animate-pulse');
      setTimeout(() => btn.classList.remove('animate-pulse'), 1000);
    }
  };

  const handleViewDetail = product => {
    setSelectedProduct(product);
    setModalOpen(true);
    storage.addToHistory(product);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const addToCart = product => {
    storage.addToCart(product);
    setCartItemsCount(storage.getCartItemsCount());
    showToast('Đã thêm vào giỏ hàng', 'success');
  };
  const showToast = (message, type = 'default') => {
    const toast = document.createElement('div');
    const bgColor =
      type === 'success'
        ? 'bg-green-500'
        : type === 'error'
        ? 'bg-red-500'
        : 'bg-gray-800';
    toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto p-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-12 bg-gray-300 rounded w-full max-w-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-blue-600">EduCommerce</h1>
            <div className="relative w-full max-w-lg">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleGetSuggestions}
                className="ai-button bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014
                    18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Gợi ý thông minh
              </button>
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              <Link to="/favorites" className="relative p-2 text-gray-600 hover:text-red-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>
              <Link to="/history" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow sticky top-24 space-y-4">
              <h3 className="font-bold text-lg">Bộ lọc</h3>
              {/* Sắp xếp */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Sắp xếp</h4>
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Mặc định</option>
                  <option value="priceAsc">Giá: thấp → cao</option>
                  <option value="priceDesc">Giá: cao → thấp</option>
                  <option value="nameAsc">Tên: A → Z</option>
                  <option value="nameDesc">Tên: Z → A</option>
                </select>
              </div>

              {/* Giá: slider + input */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Theo giá</h4>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={e => {
                      const v = Math.max(0, Math.min(Number(e.target.value), priceMax));
                      setPriceMin(v);
                    }}
                    className="w-24 p-1 border rounded"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={e => {
                      const v = Math.min(productMaxPrice, Math.max(Number(e.target.value), priceMin));
                      setPriceMax(v);
                    }}
                    className="w-24 p-1 border rounded"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm mb-1">
                    Thấp nhất: {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(priceMin)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={productMaxPrice}
                    value={priceMin}
                    step={10000}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (v <= priceMax) setPriceMin(v);
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Cao nhất: {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(priceMax)}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={productMaxPrice}
                    value={priceMax}
                    step={10000}
                    onChange={e => {
                      const v = Number(e.target.value);
                      if (v >= priceMin) setPriceMax(v);
                    }}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Danh mục */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Theo danh mục</h4>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'Tất cả' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Đánh giá */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Theo đánh giá</h4>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="rating"
                    value="all"
                    checked={ratingFilter === 'all'}
                    onChange={e => setRatingFilter(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span>Tất cả</span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="rating"
                    value="4up"
                    checked={ratingFilter === '4up'}
                    onChange={e => setRatingFilter(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span>4 ⭐ trở lên</span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="rating"
                    value="3up"
                    checked={ratingFilter === '3up'}
                    onChange={e => setRatingFilter(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span>3 ⭐ trở lên</span>
                </label>
              </div>

              {/* Xóa bộ lọc */}
              {(searchQuery ||
                priceMin > 0 ||
                priceMax < productMaxPrice ||
                categoryFilter !== 'all' ||
                ratingFilter !== 'all' ||
                sortOption !== 'default') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceMin(0);
                    setPriceMax(productMaxPrice);
                    setCategoryFilter('all');
                    setRatingFilter('all');
                    setSortOption('default');
                  }}
                  className="w-full text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-1 mt-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {showSuggestions && (
              <div className="mb-8">
                <AISuggestions
                  onProductClick={handleViewDetail}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            )}
            {(searchQuery ||
              priceMin > 0 ||
              priceMax < productMaxPrice ||
              categoryFilter !== 'all' ||
              ratingFilter !== 'all' ||
              sortOption !== 'default') && (
              <div className="mb-4 text-gray-600">
                Tìm thấy{' '}
                <span className="font-bold text-blue-600">{filteredProducts.length}</span>{' '}
                khóa học{searchQuery && <> cho "{searchQuery}"</>}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={handleViewDetail}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21
                    12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-500 text-lg">Không tìm thấy khóa học nào phù hợp</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceMin(0);
                    setPriceMax(productMaxPrice);
                    setCategoryFilter('all');
                    setRatingFilter('all');
                    setSortOption('default');
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-600"
                >
                  Xóa bộ lọc và thử lại
                </button>
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat AI Button */}
      <button
        onClick={() => setChatOpen(o => !o)}
        className="fixed bottom-4 right-4 bg-red-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-50 hover:bg-red-700 transition-colors"
        title="Chat với chúng tôi"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.4-4 8-9 8a9.02
               9.02 0 01-4.13-.97L3 20l1.03-3.87A8.96 8.96 0 013 12c0-4.4
               4-8 9-8s9 3.6 9 8z"
          />
        </svg>
      </button>

      {/* ChatbotAI Panel */}
      {chatOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col z-50">
          <ChatbotAI onClose={() => setChatOpen(false)} />
        </div>
      )}

      {/* Modal Chi tiết */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Chi tiết khóa học</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-3xl">
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={`/images/${selectedProduct.category.toLowerCase()}.jpg`}
                    alt={selectedProduct.name}
                    onError={e => { e.currentTarget.src = '/images/placeholder.jpg'; }}
                    className="w-full rounded-lg"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{selectedProduct.name}</h3>
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="ml-1 text-lg">{selectedProduct.rating}</span>
                    <span className="text-gray-500 ml-1">({selectedProduct.reviews} đánh giá)</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12
                          14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Giảng viên: <strong>{selectedProduct.instructor}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Thời lượng: <strong>{selectedProduct.duration}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9
                          9 0 0118 0z" />
                      </svg>
                      <span>Trình độ: <strong>{selectedProduct.level}</strong></span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-2">Mô tả chi tiết:</h4>
                    <p className="text-gray-700">{selectedProduct.fullDescription}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (!storage.isInCart(selectedProduct.id)) {
                          addToCart(selectedProduct);
                        }
                      }}
                      disabled={storage.isInCart(selectedProduct.id)}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                        storage.isInCart(selectedProduct.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {storage.isInCart(selectedProduct.id) ? 'Đã trong giỏ hàng' : 'Thêm vào giỏ'}
                    </button>
                    <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                      Đăng ký ngay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
