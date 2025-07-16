"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import FavoritesPage from "./pages/FavoritesPage.jsx"
import CartPage from "./pages/CartPage.jsx"
import HistoryPage from "./pages/HistoryPage.jsx"
import { storage } from "./utils/storage.js"
import LanguageToggle, { MobileLanguageToggle } from "./components/LanguageToggle.jsx"
import { useTranslation } from "./hooks/useTranslation.js"

export default function App() {
  const [cartCount, setCartCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  const refreshCounts = () => {
    setCartCount(storage.getCartItemsCount())
    setFavoriteCount(storage.getFavorites().length)
  }

  useEffect(() => {
    refreshCounts()
    window.addEventListener("storage", refreshCounts)
    return () => {
      window.removeEventListener("storage", refreshCounts)
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Skip to main content for accessibility
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a> */}
        
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/" className="logo-container flex items-center group">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-700 transition-colors duration-200">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    EduCommerce
                  </span>
                  <div className="logo-shine"></div>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <NavLink to="/" icon="home">{t('home')}</NavLink>
                <NavLink to="/favorites" icon="heart" count={favoriteCount}>{t('favorites')}</NavLink>
                <NavLink to="/history" icon="history">{t('history')}</NavLink>
                <NavLink to="/cart" icon="shopping-cart" count={cartCount}>{t('cart')}</NavLink>
                <LanguageToggle />
                <Link
                  to="/auth"
                  className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {t('login')}
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white animate-slide-down">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <MobileNavLink to="/" icon="home" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('home')}
                </MobileNavLink>
                <MobileNavLink to="/favorites" icon="heart" count={favoriteCount} onClick={() => setIsMobileMenuOpen(false)}>
                  {t('favorites')}
                </MobileNavLink>
                <MobileNavLink to="/history" icon="history" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('history')}
                </MobileNavLink>
                <MobileNavLink to="/cart" icon="shopping-cart" count={cartCount} onClick={() => setIsMobileMenuOpen(false)}>
                  {t('cart')}
                </MobileNavLink>
                <div className="pt-2 border-t border-gray-100">
                  <MobileLanguageToggle />
                </div>
                <div className="pt-2">
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-center"
                  >
                    {t('login')}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main id="main-content" className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage onRefreshCounts={refreshCounts} />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/favorites" element={<FavoritesPage onRefreshCounts={refreshCounts} />} />
            <Route path="/cart" element={<CartPage onRefreshCounts={refreshCounts} />} />
            <Route path="/history" element={<HistoryPage onRefreshCounts={refreshCounts} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold">EduCommerce</span>
                </div>
                <p className="text-gray-400 mb-4 max-w-md">
                  {t('footerDescription')}
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('aboutUs')}</a></li>
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('courses')}</a></li>
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('instructors')}</a></li>
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('blog')}</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">{t('support')}</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('privacyPolicy')}</a></li>
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('termsOfService')}</a></li>
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('contact')}</a></li>
                  <li><a href="#" className="footer-link text-gray-400 hover:text-white">{t('faq')}</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>{t('copyright')}</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

function NavLink({ to, icon, children, count }) {
  const location = useLocation()
  const isActive = location.pathname === to

  const getIcon = (iconName) => {
    switch (iconName) {
      case "home":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7m7-7v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      case "heart":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case "history":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "shopping-cart":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 21H19a1 1 0 001-1v-1M7 13l-2.293-2.293c-.63-.63-.184-1.707.707-1.707H17M23 17c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Link
      to={to}
      className={`nav-item relative flex items-center px-4 py-2 rounded-lg transition-all duration-200 gap-2 mr-2 ${
        isActive
          ? "text-blue-600 bg-blue-50 font-medium"
          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
      }`}
    >
      {getIcon(icon)}
      <span className="whitespace-nowrap">{children}</span>
      {count > 0 && (
        <span className="absolute -top-0 -right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-sm border-2 border-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}

function MobileNavLink({ to, icon, children, count, onClick }) {
  const location = useLocation()
  const isActive = location.pathname === to

  const getIcon = (iconName) => {
    switch (iconName) {
      case "home":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7m7-7v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      case "heart":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case "history":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "shopping-cart":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 21H19a1 1 0 001-1v-1M7 13l-2.293-2.293c-.63-.63-.184-1.707.707-1.707H17M23 17c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "text-blue-600 bg-blue-50 font-medium"
          : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
      }`}
    >
      <div className="flex items-center gap-3">
        {getIcon(icon)}
        <span className="whitespace-nowrap">{children}</span>
      </div>
      {count > 0 && (
        <span className="absolute -top-0 -right-0 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-sm border-2 border-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}