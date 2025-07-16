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
import { useTranslation } from "./context/TranslationContext.jsx"

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
                  {/* Social icons... */}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">{t('quickLinks')}</h3>
                <ul className="space-y-2">
                  <li><a className="footer-link" href="#">{t('aboutUs')}</a></li>
                  <li><a className="footer-link" href="#">{t('courses')}</a></li>
                  <li><a className="footer-link" href="#">{t('instructors')}</a></li>
                  <li><a className="footer-link" href="#">{t('blog')}</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">{t('support')}</h3>
                <ul className="space-y-2">
                  <li><a className="footer-link" href="#">{t('privacyPolicy')}</a></li>
                  <li><a className="footer-link" href="#">{t('termsOfService')}</a></li>
                  <li><a className="footer-link" href="#">{t('contact')}</a></li>
                  <li><a className="footer-link" href="#">{t('faq')}</a></li>
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