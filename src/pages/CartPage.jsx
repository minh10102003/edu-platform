// src/pages/CartPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../utils/storage';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      setLoading(true);
      const cart = storage.getCart();
      setCartItems(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    storage.updateCartItemQuantity(productId, newQuantity);
    loadCart();
    showToast('Đã cập nhật số lượng');
  };

  const handleRemoveItem = (productId) => {
    storage.removeFromCart(productId);
    loadCart();
    showToast('Đã xóa khỏi giỏ hàng');
  };

  const handleClearCart = () => {
    setConfirmOpen(true);
  };

  const confirmClear = () => {
    storage.clearCart();
    loadCart();
    showToast('Đã xóa toàn bộ giỏ hàng');
    setConfirmOpen(false);
  };

  const cancelClear = () => {
    setConfirmOpen(false);
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

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const totalAmount = storage.getCartTotal();
  const totalItems = storage.getCartItemsCount();

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Giỏ hàng</h1>
        <div className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Xác nhận xóa toàn bộ giỏ hàng */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Xác nhận</h2>
            <p className="mb-6">Bạn có chắc muốn xóa toàn bộ giỏ hàng?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelClear}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={confirmClear}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Giỏ hàng ({totalItems} khóa học)</h1>
        <div className="flex items-center gap-4">
          {cartItems.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              Xóa tất cả
            </button>
          )}
          <Link to="/" className="text-blue-500 hover:text-blue-600 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.product.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-32 h-24 object-cover rounded cursor-pointer hover:opacity-90"
                  onClick={() => handleViewDetail(item.product)}
                />
                <div className="flex-1">
                  <h3
                    className="font-bold text-lg cursor-pointer hover:text-blue-600"
                    onClick={() => handleViewDetail(item.product)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{item.product.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-blue-600">
                        {formatPrice(item.product.price)}
                      </span>
                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 border rounded-lg px-2">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/>
                          </svg>
                        </button>
                        <span className="px-3 py-1 min-w-[40px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="text-red-500 hover:text-red-600 p-2"
                      title="Xóa khỏi giỏ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Thành tiền: <span className="font-semibold text-gray-700">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Tổng đơn hàng</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Tạm tính ({totalItems} khóa học)</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(0)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-blue-600">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold mb-3">
                Tiến hành thanh toán
              </button>

              <Link
                to="/"
                className="block text-center text-blue-500 hover:text-blue-600"
              >
                Tiếp tục mua sắm
              </Link>

              {/* Promotion code */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Mã giảm giá</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                    Áp dụng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Khám phá khóa học ngay
          </Link>
        </div>
      )}

      {/* Modal Chi tiết (giống HomePage) */}
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
                    {formatPrice(selectedProduct.price)}
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      <span>Giảng viên: <strong>{selectedProduct.instructor}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>Thời lượng: <strong>{selectedProduct.duration}</strong></span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
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
                          storage.addToCart(selectedProduct);
                          loadCart();
                          showToast('Đã thêm vào giỏ hàng');
                        }
                      }}
                      disabled={storage.isInCart(selectedProduct.id)}
                      className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                        storage.isInCart(selectedProduct.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
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
