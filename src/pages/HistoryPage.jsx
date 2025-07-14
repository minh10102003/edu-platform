import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../utils/storage';

export default function HistoryPage() {
  const [historyProducts, setHistoryProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); 
  const [sortBy, setSortBy] = useState('recent');   
  const [filterCategory, setFilterCategory] = useState('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false); 

  useEffect(() => {
    loadHistory();
  }, [sortBy, filterCategory]);

  const loadHistory = () => {
    const entries = storage.getHistory() || [];

    let history = entries.map(entry => entry.product);

    if (filterCategory !== 'all') {
      history = history.filter(p => p.category === filterCategory);
    }

    switch (sortBy) {
      case 'name':
        history.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price':
        history.sort((a, b) => a.price - b.price);
        break;
      case 'recent':
      default:
        break;
    }

    setHistoryProducts(history);
  };

  const handleViewDetail = product => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  const clearAllHistory = () => {
    localStorage.removeItem('viewHistory');
    setHistoryProducts([]);
    showToast('Đã xóa lịch sử xem');
  };

  const removeFromHistory = productId => {
    const updated = historyProducts.filter(p => p.id !== productId);
    const entries = updated.map(product => ({
      product,
      firstViewed: 0,
      lastViewed: 0,
      viewCount: 0,
      totalViewTime: 0
    }));
    localStorage.setItem('viewHistory', JSON.stringify(entries));
    setHistoryProducts(updated);
    showToast('Đã xóa khỏi lịch sử');
  };

  const showToast = message => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  // Get unique categories từ history trong storage
  const categories = [
    'all',
    ...new Set((storage.getHistory() || []).map(entry => entry.product.category))
  ];

  // Thống kê
  const stats = {
    total: historyProducts.length,
    categories: new Set(historyProducts.map(p => p.category)).size,
    totalValue: historyProducts.reduce((sum, p) => sum + p.price, 0),
    avgRating:
      historyProducts.length > 0
        ? (historyProducts.reduce((sum, p) => sum + p.rating, 0) / historyProducts.length).toFixed(1)
        : 0
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Lịch sử xem</h1>
        <div className="flex items-center gap-4">
          {historyProducts.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="text-red-500 hover:text-red-600 flex items-center gap-2"
            >
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
                  d="M19 7l-.867 12.142A2 2 0
                     0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                     4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0
                     00-1 1v3M4 7h16"
                />
              </svg>
              Xóa tất cả
            </button>
          )}
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Quay lại
          </Link>
        </div>
      </div>

      {/* Popup xác nhận xóa toàn bộ */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Xác nhận</h2>
            <p className="mb-6">Bạn có chắc muốn xóa toàn bộ lịch sử xem?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  clearAllHistory();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nếu có history */}
      {historyProducts.length > 0 ? (
        <>
          {/* Thống kê */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-2xl font-bold">{stats.total}</div>
              <div className="text-gray-600 text-sm">Khóa học đã xem</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-2xl font-bold">{stats.categories}</div>
              <div className="text-gray-600 text-sm">Danh mục</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-2xl font-bold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalValue)}
              </div>
              <div className="text-gray-600 text-sm">Tổng giá trị</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-yellow-600 text-2xl font-bold">⭐ {stats.avgRating}</div>
              <div className="text-gray-600 text-sm">Đánh giá TB</div>
            </div>
          </div>

          {/* Bộ lọc & điều khiển */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Danh mục:</span>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Gần đây nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="price">Giá thấp đến cao</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6a2 2 0 012-2h2a2 2 0 012
                         2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14
                         6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0
                         01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0
                         012-2h2a2 2 0 012 2v2a2 2 0 01-2
                         2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2
                         2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0
                         01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {historyProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow relative group"
                >
                  {/* badge */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded z-10">
                    #{idx + 1}
                  </div>
                  {/* remove */}
                  <button
                    onClick={() => removeFromHistory(product.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="p-4">
                    <img src={product.image} alt={product.name}
                      className="w-full h-48 object-cover rounded mb-3" />
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600 mb-3">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </p>
                    <button
                      onClick={() => handleViewDetail(product)}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {historyProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow p-4 flex gap-4 items-center group"
                >
                  <div className="text-blue-500 font-bold">#{idx + 1}</div>
                  <img src={product.image} alt={product.name}
                    className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.shortDescription}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-yellow-500">★ {product.rating}</span>
                      <span className="text-gray-500 capitalize">{product.category}</span>
                      <span className="font-bold text-blue-600">
                        {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(product.price)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetail(product)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Chi tiết
                  </button>
                  <button
                    onClick={() => removeFromHistory(product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0
                           0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5
                           4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1
                           1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0
                 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">Chưa có lịch sử xem nào</p>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Khám phá khóa học ngay
          </Link>
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
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full rounded-lg" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{selectedProduct.name}</h3>
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="ml-1 text-lg">{selectedProduct.rating}</span>
                    <span className="text-gray-500 ml-1">({selectedProduct.reviews} đánh giá)</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-4">
                    {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(selectedProduct.price)}
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Trình độ: <strong>{selectedProduct.level}</strong></span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-2">Mô tả chi tiết:</h4>
                    <p className="text-gray-700">{selectedProduct.fullDescription}</p>
                  </div>
                  <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                    Đăng ký ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
