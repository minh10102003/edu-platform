"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0) // 0-4 for strength indicator
  const [error, setError] = useState("")

  const checkPasswordStrength = (pw) => {
    let strength = 0
    if (pw.length > 7) strength++
    if (pw.match(/[a-z]/) && pw.match(/[A-Z]/)) strength++
    if (pw.match(/\d/)) strength++
    if (pw.match(/[^a-zA-Z0-9]/)) strength++
    setPasswordStrength(strength)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    checkPasswordStrength(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ email và mật khẩu.")
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }

    if (!isLogin && passwordStrength < 3) {
      setError("Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu mạnh hơn.")
      return
    }

    if (isLogin) {
      // Simulate login
      console.log("Đăng nhập với:", { email, password })
      alert("Đăng nhập thành công! (Chức năng giả lập)")
      // Redirect or update auth state
    } else {
      // Simulate registration
      console.log("Đăng ký với:", { email, password })
      alert("Đăng ký thành công! (Chức năng giả lập)")
      setIsLogin(true) // Switch to login after successful registration
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md transform transition-all duration-500 ease-in-out scale-95 hover:scale-100">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8 animate-fade-in-up">
          {isLogin ? "Đăng nhập" : "Đăng ký"}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-fade-in">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="your@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            {!isLogin && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength === 0
                        ? "w-0"
                        : passwordStrength === 1
                          ? "w-1/4 bg-red-500"
                          : passwordStrength === 2
                            ? "w-1/2 bg-orange-500"
                            : passwordStrength === 3
                              ? "w-3/4 bg-yellow-500"
                              : "w-full bg-green-500"
                    }`}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {passwordStrength === 0
                    ? "Rất yếu"
                    : passwordStrength === 1
                      ? "Yếu"
                      : passwordStrength === 2
                        ? "Trung bình"
                        : passwordStrength === 3
                          ? "Mạnh"
                          : "Rất mạnh"}
                </p>
              </div>
            )}
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận Mật khẩu
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg animate-fade-in-up animation-delay-200 whitespace-nowrap"
          >
            {isLogin ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-600 animate-fade-in-up animation-delay-400">
          {isLogin ? (
            <p>
              Chưa có tài khoản?{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline font-medium whitespace-nowrap"
              >
                Đăng ký ngay
              </button>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline font-medium whitespace-nowrap"
              >
                Đăng nhập
              </button>
            </p>
          )}
          <Link
            to="/"
            className="block mt-4 text-sm text-gray-500 hover:text-blue-600 hover:underline whitespace-nowrap"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
