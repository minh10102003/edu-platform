"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import HomePage from "./pages/HomePage.jsx" // Added .jsx
import AuthPage from "./pages/AuthPage.jsx" // Added .jsx
import FavoritesPage from "./pages/FavoritesPage.jsx" // Added .jsx
import CartPage from "./pages/CartPage.jsx" // Added .jsx
import HistoryPage from "./pages/HistoryPage.jsx" // Added .jsx
import { storage } from "./utils/storage.js" // Added .js

export default function App() {
  const [cartCount, setCartCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)

  const refreshCounts = () => {
    setCartCount(storage.getCartItemsCount())
    setFavoriteCount(storage.getFavorites().length)
  }

  useEffect(() => {
    refreshCounts()
    // Listen for storage changes to update counts across tabs/windows
    window.addEventListener("storage", refreshCounts)
    return () => {
      window.removeEventListener("storage", refreshCounts)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                {/* Removed EduCommerce Logo and text */}
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <span className="ml-2 text-2xl font-bold text-gray-900">EduCommerce</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <NavLink to="/" icon="home">
                  Trang chủ
                </NavLink>
                <NavLink to="/favorites" icon="heart" count={favoriteCount}>
                  Yêu thích
                </NavLink>
                <NavLink to="/history" icon="history">
                  Lịch sử
                </NavLink>
                <NavLink to="/cart" icon="shopping-cart" count={cartCount}>
                  Giỏ hàng
                </NavLink>
                <Link
                  to="/auth"
                  className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md whitespace-nowrap"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<HomePage onRefreshCounts={refreshCounts} />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/favorites" element={<FavoritesPage onRefreshCounts={refreshCounts} />} />
          <Route path="/cart" element={<CartPage onRefreshCounts={refreshCounts} />} />
          <Route path="/history" element={<HistoryPage onRefreshCounts={refreshCounts} />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; 2023 EduCommerce. All rights reserved.</p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Điều khoản dịch vụ
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Liên hệ
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

function NavLink({ to, icon, children, count }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case "home":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7m7-7v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        )
      case "heart":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )
      case "history":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )
      case "shopping-cart":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 21H19a1 1 0 001-1v-1M7 13l-2.293-2.293c-.63-.63-.184-1.707.707-1.707H17M23 17c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z"
            />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Link
      to={to}
      className="relative flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 gap-2" // Added gap-2 for better spacing
    >
      {getIcon(icon)}
      <span className="whitespace-nowrap">{children}</span>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  )
}
