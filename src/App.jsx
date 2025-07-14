import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import HomePage      from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import HistoryPage   from './pages/HistoryPage';
import CartPage      from './pages/CartPage';
import AuthPage      from './pages/AuthPage';
import { storage }   from './utils/storage';

function App() {
  const [currentUser, setCurrentUser] = useState(storage.getUser());

  useEffect(() => {
    setCurrentUser(storage.getUser());
  }, []);

  const handleLogout = () => {
    storage.clearUser();
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="text-xl font-bold">
                EduCommerce
              </Link>
              <div className="flex items-center gap-6">
                <Link to="/" className="hover:text-blue-200 transition-colors">
                  Trang chủ
                </Link>
                <Link
                  to="/favorites"
                  className="hover:text-blue-200 transition-colors flex items-center gap-2"
                >
                  {/* Heart icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5
                        4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  Yêu thích
                </Link>
                <Link
                  to="/history"
                  className="hover:text-blue-200 transition-colors flex items-center gap-2"
                >
                  {/* History icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0
                        11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lịch sử
                </Link>
                <Link
                  to="/cart"
                  className="hover:text-blue-200 transition-colors flex items-center gap-2"
                >
                  {/* Cart icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4
                        M7 13l-1.3 5.5a1 1 0 001 1.2h12.6
                        a1 1 0 001-1.2L17 13M7 13H5.4
                        M17 13l1.3 5.5M6 21a1 1 0 102 0
                        1 1 0 00-2 0zm12 0a1 1 0 102 0
                        1 1 0 00-2 0z"
                    />
                  </svg>
                  Giỏ hàng
                </Link>

                {/* Authentication button */}
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 hover:text-blue-200 transition-colors"
                  >
                    {/* Logout icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5"
                      />
                    </svg>
                    {currentUser.email}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="flex items-center gap-1 hover:text-blue-200 transition-colors"
                  >
                    {/* User icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.5
                           0 4.847.69 6.879 1.804M15 11a3 3 0
                           11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/"           element={<HomePage />} />
          <Route path="/favorites"  element={<FavoritesPage />} />
          <Route path="/history"    element={<HistoryPage />} />
          <Route path="/cart"       element={<CartPage />} />
          <Route
            path="/auth"
            element={<AuthPage onAuthSuccess={u => setCurrentUser(u)} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
