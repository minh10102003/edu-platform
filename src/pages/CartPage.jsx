"use client"

import { useState, useEffect, useMemo } from "react"
import { storage } from "../utils/storage.js"
import ProductModal from "../components/product/ProductModal.jsx"
import { useTranslation } from "../context/TranslationContext.jsx"
import i18n from "../utils/i18n.js"

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

const PROMO_CODES = {
  NEWSTUDENT: {
    discount: 0.15,
    description: "Giảm 15% cho học viên mới",
    minOrder: 0
  },
  SAVE20: {
    discount: 0.20,
    description: "Giảm 20% đơn hàng từ 1 triệu",
    minOrder: 1000000
  },
  EDUCATION50: {
    discount: 0.50,
    description: "Giảm 50% cho sinh viên",
    minOrder: 0
  },
  HOLIDAY30: {
    discount: 0.30,
    description: "Giảm 30% mùa lễ hội",
    minOrder: 500000
  },
  WEEKEND10: {
    discount: 0.10,
    description: "Giảm 10% cuối tuần",
    minOrder: 0
  }
}

export default function CartPage({ onRefreshCounts }) {
  const { t, currentLanguage: langFromCtx } = useTranslation()
  const currentLanguage = langFromCtx || i18n.getCurrentLanguage()

  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState("")
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [orderData, setOrderData] = useState({
    studentName: "",
    email: "",
    phone: "",
    motivation: "",
    paymentMethod: "credit-card"
  })

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState("")
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState(() => () => {})

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        const storedCart = storage.getCart()
        setCartItems(storedCart)
      } catch (err) {
        setError(t("errorLoadingCartData"))
        console.error("Error fetching cart data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [t])

  const coursesInCart = useMemo(
    () => cartItems.map((item) => ({ ...item.product, addedAt: item.addedAt })),
    [cartItems]
  )

  const handleRemoveCourseClick = (productId) => {
    setConfirmTitle(t("removeCourseTitle"))
    setConfirmMessage(t("removeCourseMessage"))
    setConfirmAction(() => () => {
      const updatedCart = storage.removeFromCart(productId)
      setCartItems(updatedCart)
      createToast(t("toastRemovedCourse"), "info")
      onRefreshCounts()
      setShowConfirmDialog(false)
    })
    setShowConfirmDialog(true)
  }

  const handleClearCartClick = () => {
    setConfirmTitle(t("clearCartTitle"))
    setConfirmMessage(t("clearCartMessage"))
    setConfirmAction(() => () => {
      storage.clearCart()
      setCartItems([])
      createToast(t("toastClearedCart"), "success")
      onRefreshCounts()
      setShowConfirmDialog(false)
    })
    setShowConfirmDialog(true)
  }

  const handleViewDetail = (product) => {
    setSelectedProduct(product)
  }
  const handleCloseModal = () => setSelectedProduct(null)

  const subtotal = coursesInCart.reduce((sum, course) => sum + course.price, 0)
  const discountAmount = appliedPromo ? subtotal * appliedPromo.discount : 0
  const total = subtotal - discountAmount

  const applyPromoCode = () => {
    setPromoError("")
    const code = promoCode.toUpperCase().trim()

    if (!code) {
      setPromoError(t("promoEmptyError"))
      return
    }

    const promoData = PROMO_CODES[code]
    if (!promoData) {
      setPromoError(t("promoInvalidError"))
      createToast(t("toastPromoInvalid"), "error")
      return
    }

    if (subtotal < promoData.minOrder) {
      setPromoError(
        t("promoMinOrderError", {
          amount: formatPrice(promoData.minOrder)
        })
      )
      createToast(t("toastPromoMinError"), "error")
      return
    }

    setAppliedPromo({ code, ...promoData })
    createToast(
      t("toastPromoApplied", {
        code,
        percent: (promoData.discount * 100).toFixed(0)
      }),
      "success"
    )
  }

  const removePromoCode = () => {
    setAppliedPromo(null)
    setPromoCode("")
    setPromoError("")
    createToast(t("toastPromoRemoved"), "info")
  }

  const proceedToNextStep = () => {
    if (coursesInCart.length === 0) {
      createToast(t("toastCartEmpty"), "error")
      return
    }
    setCheckoutStep(2)
  }

  const handleInputChange = (field, value) => {
    setOrderData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStudentInfo = () => {
    const { studentName, email, phone } = orderData
    if (!studentName.trim()) {
      createToast(t("toastRequireName"), "error")
      return false
    }
    if (!email.trim() || !email.includes("@")) {
      createToast(t("toastRequireEmail"), "error")
      return false
    }
    if (!phone.trim()) {
      createToast(t("toastRequirePhone"), "error")
      return false
    }
    return true
  }

  const completeEnrollment = () => {
    const enrollmentData = {
      courses: coursesInCart,
      student: orderData,
      total,
      appliedPromo,
      enrollmentDate: new Date().toISOString(),
      enrollmentId: `EDU-${Date.now()}`
    }

    storage.clearCart()
    setCartItems([])
    setCheckoutStep(4)
    onRefreshCounts()

    setOrderData((prev) => ({ ...prev, ...enrollmentData }))
  }

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

  const getCategoryColor = (category) => {
    const colors = {
      art: "bg-pink-50 text-pink-700 border-pink-200",
      business: "bg-blue-50 text-blue-700 border-blue-200",
      design: "bg-purple-50 text-purple-700 border-purple-200",
      music: "bg-green-50 text-green-700 border-green-200",
      programming: "bg-orange-50 text-orange-700 border-orange-200",
      photography: "bg-indigo-50 text-indigo-700 border-indigo-200",
      marketing: "bg-red-50 text-red-700 border-red-200",
      english: "bg-yellow-50 text-yellow-700 border-yellow-200",
      finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
      health: "bg-teal-50 text-teal-700 border-teal-200"
    }
    return colors[category?.toLowerCase()] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">{t("loadingCart")}</p>
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856
                   c1.54 0 2.502-1.667 1.732-2.5L13.732
                   4c-.77-.833-1.964-.833-2.732 0L3.732
                   16.5c-.77.833.192 2.5 1.732 2.5z"
              />
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
    <div className="container mx-auto px-2 sm:px-4 py-6 overflow-x-hidden">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-start space-x-6 mb-4 overflow-x-auto py-2">
          {[
            { step: 1, title: t("stepCart") },
            { step: 2, title: t("stepInfo") },
            { step: 3, title: t("stepPayment") },
            { step: 4, title: t("stepConfirm") }
          ].map(({ step, title }) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step <= checkoutStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                {step < checkoutStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-sm font-medium">{step}</span>
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  step <= checkoutStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {title}
              </span>
              {step < 4 && (
                <div
                  className={`w-8 h-0.5 ml-4 ${
                    step < checkoutStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center animate-fade-in-up">
        {checkoutStep === 1 && t("cartPageTitle")}
        {checkoutStep === 2 && t("infoPageTitle")}
        {checkoutStep === 3 && t("paymentPageTitle")}
        {checkoutStep === 4 && t("confirmPageTitle")}
      </h1>

      {coursesInCart.length === 0 && checkoutStep !== 4 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7
                   13L5.4 21H19a1 1 0 001-1v-1M7
                   13l-2.293-2.293c-.63-.63-.184-1.707
                   .707-1.707H17"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t("emptyCartTitle")}</h3>
            <p className="text-gray-600 mb-4">{t("emptyCartText")}</p>
            <a
              href="/"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-block"
            >
              {t("exploreCourses")}
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 animate-fade-in">
            {checkoutStep === 1 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{t("selectedCourses")}</h2>
                  {coursesInCart.length > 0 && (
                    <button
                      onClick={handleClearCartClick}
                      className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                    >
                      {t("clearAllCart")}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {coursesInCart.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className="cursor-pointer flex items-center flex-1"
                        onClick={() => handleViewDetail(course)}
                      >
                        <img
                          src={`/images/${course.category?.toLowerCase()}.jpg`}
                          alt={course.name}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=80&width=120"
                          }}
                          className="w-20 h-20 object-cover rounded-lg mr-4 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                            {course.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{course.shortDescription}</p>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                                course.category
                              )}`}
                            >
                              {course.category}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
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
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <svg
                                className="w-4 h-4 text-yellow-400"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87
                                     1.18 6.88L12 17.77l-6.18 3.25L7
                                     14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                              <span>
                                {course.rating} ({course.reviews} {t("Reviews")})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">
                            {formatPrice(course.price)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveCourseClick(course.id)}
                        className="ml-4 p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={t("removeCourseAria")}
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
                               0116.138 21H7.862a2 2 0
                               01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4
                               a1 1 0 00-1-1h-4a1 1 0 00-1
                               1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={proceedToNextStep}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                  >
                    {t("proceedToRegister")}
                  </button>
                </div>
              </>
            )}

            {checkoutStep === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("infoPageHeader")}</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="studentName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("labelName")} *
                      </label>
                      <input
                        type="text"
                        id="studentName"
                        value={orderData.studentName}
                        onChange={(e) => handleInputChange("studentName", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={t("placeholderName")}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("labelEmail")} *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={orderData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={t("placeholderEmail")}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("labelPhone")} *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={orderData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder={t("placeholderPhone")}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="motivation"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {t("labelMotivation")} ({t("optional")})
                    </label>
                    <textarea
                      id="motivation"
                      value={orderData.motivation}
                      onChange={(e) => handleInputChange("motivation", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder={t("placeholderMotivation")}
                    />
                  </div>
                </form>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCheckoutStep(1)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={() => {
                      if (validateStudentInfo()) {
                        setCheckoutStep(3)
                      }
                    }}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
                  >
                    {t("continue")}
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {t("paymentPageHeader")}
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      value: "credit-card",
                      title: t("paymentCreditCard"),
                      desc: t("paymentCreditDesc")
                    },
                    {
                      value: "bank-transfer",
                      title: t("paymentBankTransfer"),
                      desc: t("paymentBankDesc")
                    },
                    {
                      value: "e-wallet",
                      title: t("paymentEwallet"),
                      desc: t("paymentEwalletDesc")
                    },
                    {
                      value: "installment",
                      title: t("paymentInstallment"),
                      desc: t("paymentInstallmentDesc")
                    }
                  ].map((method) => (
                    <label
                      key={method.value}
                      className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors border-2 border-transparent has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={orderData.paymentMethod === method.value}
                        onChange={(e) =>
                          handleInputChange("paymentMethod", e.target.value)
                        }
                        className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-4 flex-1">
                        <div className="font-medium text-gray-900">
                          {method.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {method.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2
                           0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002
                           2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-blue-800">
                      {t("securePayment")}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCheckoutStep(2)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    {t("back")}
                  </button>
                  <button
                    onClick={completeEnrollment}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md"
                  >
                    {t("completeRegistration")}
                  </button>
                </div>
              </div>
            )}

            {checkoutStep === 4 && (
              <div className="animate-fade-in text-center py-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t("confirmSuccessTitle")}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {t("confirmThankYou")}
                </p>

                <div className="bg-gray-50 rounded-lg p-6 text-left mb-8 max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {t("registrationInfoTitle")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t("labelEnrollmentId")}</span>{" "}
                      <span className="font-medium">{orderData.enrollmentId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("labelStudent")}</span>{" "}
                      <span className="font-medium">{orderData.studentName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("labelEmail")}</span>{" "}
                      <span className="font-medium">{orderData.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("labelCoursesCount")}</span>{" "}
                      <span className="font-medium">
                        {orderData.courses?.length || 0}{" "}
                        {t("coursesLabel")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("labelTotalFee")}</span>{" "}
                      <span className="font-medium text-blue-600">
                        {formatPrice(orderData.total || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <a
                    href="/"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {t("home")}
                  </a>
                  <a
                    href="/courses"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    {t("exploreCourses")}
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {checkoutStep !== 4 && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-4 sm:top-8 w-full lg:w-auto animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {t("orderSummary")}
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>
                    {t("subtotalLabel", { count: coursesInCart.length })}
                  </span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      {t("discountLabel", { code: appliedPromo.code })}
                    </span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>{t("totalLabel")}</span>
                    <span className="text-blue-600">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {checkoutStep === 1 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    {t("promoCodeTitle")}
                  </h4>
                  <div className="space-y-3">
                    {/* flex-col trên mobile, row từ sm */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t("placeholderPromoCode")}
                        className="w-full flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      <button
                        onClick={applyPromoCode}
                        className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        {t("applyPromo")}
                      </button>
                    </div>

                    {promoError && (
                      <p className="text-red-600 text-sm">{promoError}</p>
                    )}

                    {appliedPromo && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-green-800 font-medium">
                              {appliedPromo.code}
                            </span>
                            <p className="text-green-600 text-xs">
                              {appliedPromo.description}
                            </p>
                          </div>
                          <button
                            onClick={removePromoCode}
                            className="text-green-600 hover:text-green-800 p-1"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      {t("availablePromoTitle")}
                    </h5>
                    <div className="space-y-2">
                      {Object.entries(PROMO_CODES).map(([code, data]) => (
                        <div
                          key={code}
                          className="bg-gray-50 rounded p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => setPromoCode(code)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-xs text-blue-600">
                              {code}
                            </span>
                            <span className="text-xs text-gray-600">
                              -{(data.discount * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {data.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{t("featureLifetime")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{t("featureSupport")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{t("featureCertificate")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{t("featureRefund")}</span>
                </div>
              </div>
            </div>
          )}
        </div>
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
