import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import AISuggestions from '../components/product/AISuggestions';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    loadProducts();
    setFavorites(storage.getFavorites());
    setCartItemsCount(storage.getCartItemsCount());
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, priceFilter, products]);

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

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    switch (priceFilter) {
      case 'under500':
        filtered = filtered.filter(p => p.price < 500000);
        break;
      case '500to1m':
        filtered = filtered.filter(p => p.price >= 500000 && p.price <= 1000000);
        break;
      case 'over1m':
        filtered = filtered.filter(p => p.price > 1000000);
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleGetSuggestions = () => {
    setShowSuggestions(true);
    
    // Animate button
    const button = document.querySelector('.ai-button');
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 1000);
    }
  };

  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
    storage.addToHistory(product);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    
    if (favorites.includes(productId)) {
      storage.removeFavorite(productId);
      setFavorites(favorites.filter(id => id !== productId));
      showToast('Đã xóa khỏi yêu thích');
    } else {
      storage.addFavorite(productId);
      setFavorites([...favorites, productId]);
      showToast('Đã thêm vào yêu thích', 'success');
    }
  };

  const addToCart = (product) => {
    storage.addToCart(product);
    setCartItemsCount(storage.getCartItemsCount());
    showToast('Đã thêm vào giỏ hàng', 'success');
  };

  const showToast = (message, type = 'default') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-800';
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
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-gray-300 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-blue-600">EduCommerce AI</h1>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-lg">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* AI Button */}
              <button
                onClick={handleGetSuggestions}
                className="ai-button bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Gợi ý thông minh
              </button>

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Favorites */}
              <Link 
                to="/favorites" 
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>

              {/* History */}
              <Link 
                to="/history" 
                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Bộ lọc
              </h3>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700 mb-2">Theo giá</h4>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="price"
                    value="all"
                    checked={priceFilter === 'all'}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span>Tất cả</span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="price"
                    value="under500"
                    checked={priceFilter === 'under500'}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span>Dưới 500K</span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="price"
                    value="500to1m"
                    checked={priceFilter === '500to1m'}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span>500K - 1 triệu</span>
                </label>
                <label className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="price"
                    value="over1m"
                    checked={priceFilter === 'over1m'}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <span>Trên 1 triệu</span>
                </label>
              </div>

              {/* Clear filters */}
              {(searchQuery || priceFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceFilter('all');
                  }}
                  className="mt-4 w-full text-blue-600 hover:text-blue-700 text-sm flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* AI Suggestions Component */}
            {showSuggestions && (
              <div className="mb-8">
                <AISuggestions 
                  onProductClick={handleViewDetail}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            )}

            {/* Results info */}
            {(searchQuery || priceFilter !== 'all') && (
              <div className="mb-4 text-gray-600">
                Tìm thấy <span className="font-bold text-blue-600">{filteredProducts.length}</span> khóa học
                {searchQuery && <span> cho "{searchQuery}"</span>}
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 relative group">
                  {/* Favorite button */}
                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className={`absolute top-2 right-2 p-2 rounded-full z-10 transform transition-all duration-300 ${
                      favorites.includes(product.id) 
                        ? 'bg-red-500 text-white scale-100' 
                        : 'bg-white text-gray-600 shadow-md scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill={favorites.includes(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  <div className="p-4">
                    <div className="relative overflow-hidden rounded-lg mb-3">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{product.rating}</span>
                        <span className="text-gray-400 text-sm ml-1">({product.reviews})</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded capitalize">
                        {product.category}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-blue-600 mb-3">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>
                    <button 
                      onClick={() => handleViewDetail(product)}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors transform hover:scale-105"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg">Không tìm thấy khóa học nào phù hợp</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPriceFilter('all');
                  }}
                  className="mt-4 text-blue-500 hover:text-blue-600"
                >
                  Xóa bộ lọc và thử lại
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Chi tiết với nút Thêm vào giỏ */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Chi tiết khóa học</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Giảng viên: <strong>{selectedProduct.instructor}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Thời lượng: <strong>{selectedProduct.duration}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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