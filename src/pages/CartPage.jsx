"use client"

import { useState, useEffect, useMemo } from "react"
import { storage } from "../utils/storage.js"
import ProductModal from "../components/product/ProductModal.jsx"
import { api } from "../services/api.js"

export default function CartPage({ onRefreshCounts }) {
  const [cartItems, setCartItems] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [promoCode, setPromoCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [promoError, setPromoError] = useState("")
  const [checkoutStep, setCheckoutStep] = useState(1) // 1: Cart, 2: Shipping, 3: Payment, 4: Confirmation

  // States for inline confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState("")
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState(() => () => {}) // Callback function for confirmation

  useEffect(() => {
    const fetchProductsAndCart = async () => {
      try {
        setLoading(true)
        const productsData = await api.getProducts()
        setAllProducts(productsData.data)
        const storedCart = storage.getCart()
        setCartItems(storedCart)
      } catch (err) {
        setError("Không thể tải dữ liệu giỏ hàng. Vui lòng thử lại sau.")
        console.error("Error fetching cart data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProductsAndCart()
  }, [])

  const productsInCart = useMemo(() => {
    return cartItems.map((item) => ({ ...item.product, quantity: item.quantity }))
  }, [cartItems, allProducts])

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) newQuantity = 1
    const updatedCart = storage.updateCartItemQuantity(productId, newQuantity)
    setCartItems(updatedCart)
    onRefreshCounts()
  }

  const handleRemoveItemClick = (productId) => {
    setConfirmTitle("Xác nhận xóa sản phẩm")
    setConfirmMessage("Bạn có chắc chắn muốn xóa khóa học này khỏi giỏ hàng không?")
    setConfirmAction(() => () => {
      const updatedCart = storage.removeFromCart(productId)
      setCartItems(updatedCart)
      showToast("Đã xóa sản phẩm khỏi giỏ hàng", "info")
      onRefreshCounts()
      setShowConfirmDialog(false)
    })
    setShowConfirmDialog(true)
  }

  const handleClearCartClick = () => {
    setConfirmTitle("Xác nhận xóa giỏ hàng")
    setConfirmMessage("Bạn có chắc chắn muốn xóa toàn bộ các khóa học khỏi giỏ hàng không?")
    setConfirmAction(() => () => {
      const clearedCart = storage.clearCart()
      setCartItems(clearedCart)
      showToast("Đã xóa toàn bộ giỏ hàng", "success")
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

  const subtotal = productsInCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal - appliedDiscount

  const applyPromoCode = () => {
    setPromoError("")
    setAppliedDiscount(0)
    if (promoCode.toLowerCase() === "giamgia10") {
      setAppliedDiscount(subtotal * 0.1)
      showToast("Áp dụng mã giảm giá thành công!", "success")
    } else {
      setPromoError("Mã giảm giá không hợp lệ.")
      showToast("Mã giảm giá không hợp lệ!", "error")
    }
  }

  const proceedToCheckout = () => {
    if (productsInCart.length === 0) {
      showToast("Giỏ hàng của bạn đang trống!", "error")
      return
    }
    setCheckoutStep(2)
  }

  const completeOrder = () => {
    storage.clearCart()
    setCartItems([])
    setCheckoutStep(4)
    onRefreshCounts()
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

  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

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
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center animate-fade-in-up">Giỏ hàng của bạn</h1>

      {productsInCart.length === 0 && checkoutStep !== 4 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-600 text-lg">
          Giỏ hàng của bạn đang trống. Hãy thêm một vài khóa học nhé!
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items / Checkout Steps */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 animate-fade-in">
            {checkoutStep === 1 && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Các khóa học trong giỏ</h2>
                <div className="space-y-6">
                  {productsInCart.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row items-center bg-gray-50 rounded-lg p-4 shadow-sm relative"
                    >
                      <img
                        src={`/images/${item.category.toLowerCase()}.jpg` || "/placeholder.svg"}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4 flex-shrink-0"
                      />
                      <div className="flex-grow text-center sm:text-left">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.shortDescription}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                          <span className="text-xl font-bold text-blue-600">{formatPrice(item.price)}</span>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-md"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="px-3 py-1 text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-md"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItemClick(item.id)}
                        className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-8 gap-4">
                  <button
                    onClick={handleClearCartClick}
                    className="py-3 px-6 bg-red-500 text-white rounded-lg font-semibold text-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap flex-1"
                  >
                    Xóa toàn bộ giỏ hàng
                  </button>
                  <button
                    onClick={proceedToCheckout}
                    className="py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap flex-1"
                  >
                    Tiến hành thanh toán
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin giao hàng</h2>
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      id="address"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Số nhà, tên đường, phường/xã"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Tỉnh/Thành phố
                    </label>
                    <input
                      type="text"
                      id="city"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Hà Nội"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="09xxxxxxxx"
                    />
                  </div>
                </form>
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap"
                  >
                    Quay lại giỏ hàng
                  </button>
                  <button
                    onClick={() => setCheckoutStep(3)}
                    className="py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md whitespace-nowrap"
                  >
                    Tiếp tục thanh toán
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Phương thức thanh toán</h2>
                <div className="space-y-4">
                  <label className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="creditCard"
                      className="form-radio h-5 w-5 text-blue-600"
                      defaultChecked
                    />
                    <span className="ml-3 text-gray-800 font-medium whitespace-nowrap">Thẻ tín dụng/Ghi nợ</span>
                  </label>
                  <label className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      className="form-radio h-5 w-5 text-blue-600"
                    />
                    <span className="ml-3 text-gray-800 font-medium whitespace-nowrap">PayPal</span>
                  </label>
                  <label className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors">
                    <input type="radio" name="paymentMethod" value="cod" className="form-radio h-5 w-5 text-blue-600" />
                    <span className="ml-3 text-gray-800 font-medium whitespace-nowrap">
                      Thanh toán khi nhận hàng (COD)
                    </span>
                  </label>
                </div>
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap"
                  >
                    Quay lại thông tin
                  </button>
                  <button
                    onClick={completeOrder}
                    className="py-3 px-6 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-md whitespace-nowrap"
                  >
                    Hoàn tất đơn hàng
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 4 && (
              <div className="animate-fade-in text-center py-12">
                <div className="flex items-center justify-center mb-6">
                  <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Đặt hàng thành công!</h2>
                <p className="text-gray-600 text-lg mb-6">Cảm ơn bạn đã mua sắm tại EduCommerce.</p>
                <button
                  onClick={() => {
                    setCheckoutStep(1)
                    window.location.href = "/"
                  }}
                  className="py-3 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 h-fit animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Tóm tắt đơn hàng</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-700">
                <span>Tổng phụ:</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Giảm giá:</span>
                <span className="font-semibold text-red-500">- {formatPrice(appliedDiscount)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-4 mt-4">
                <span>Tổng cộng:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Mã giảm giá</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  className="flex-grow border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button
                  onClick={applyPromoCode}
                  className="px-5 py-3 bg-blue-500 text-white rounded-md font-semibold hover:bg-blue-600 transition-colors whitespace-nowrap"
                >
                  Áp dụng
                </button>
              </div>
              {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-800 mb-3">Thanh toán an toàn</h3>
              <div className="flex items-center gap-4">
                <img src="/images/visa.png" alt="Visa" className="h-8" />
                <img src="/images/mastercard.png" alt="Mastercard" className="h-8" />
                <img src="/images/paypal.png" alt="PayPal" className="h-8" />
                <span className="text-green-600 font-medium flex items-center gap-1 whitespace-nowrap">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944c-1.274 0-2.513.27-3.663.794L2.207 7.593a1 1 0 00-.16 1.432l4.79 7.014a1 1 0 00.82 1.432h10.706a1 1 0 00.82-1.432l4.79-7.014a1 1 0 00-.16-1.432l-6.13-4.843z"
                    />
                  </svg>
                  Bảo mật SSL
                </span>
              </div>
            </div>
          </div>
        </div>
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
