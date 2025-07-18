"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "../context/TranslationContext.jsx"
import i18n from "../utils/i18n.js"

export default function AuthPage() {
  const { t, currentLanguage: langFromCtx } = useTranslation()
  const currentLanguage = langFromCtx || i18n.getCurrentLanguage()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0) 
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
      setError(t("errorFillFields"))
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError(t("errorPasswordMismatch"))
      return
    }

    if (!isLogin && passwordStrength < 3) {
      setError(t("errorPasswordWeak"))
      return
    }

    if (isLogin) {
      console.log("Đăng nhập với:", { email, password })
      alert(t("successLogin"))
    } else {
      console.log("Đăng ký với:", { email, password })
      alert(t("successSignup"))
      setIsLogin(true) 
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md transform transition-all duration-500 ease-in-out scale-95 hover:scale-100">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8 animate-fade-in-up">
          {isLogin ? t("signIn") : t("signUp")}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-fade-in">
            <strong className="font-bold">!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t("authEmailLabel")}
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder={t("authEmailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t("authPasswordLabel")}
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder={t("authPasswordPlaceholder")}
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
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {passwordStrength === 0
                    ? t("passwordStrengthVeryWeak")
                    : passwordStrength === 1
                      ? t("passwordStrengthWeak")
                      : passwordStrength === 2
                        ? t("passwordStrengthMedium")
                        : passwordStrength === 3
                          ? t("passwordStrengthStrong")
                          : t("passwordStrengthVeryStrong")}
                </p>
              </div>
            )}
          </div>
          {!isLogin && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t("authConfirmPasswordLabel")}
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder={t("authPasswordPlaceholder")}
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
            {isLogin ? t("signIn") : t("signUp")}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-600 animate-fade-in-up animation-delay-400">
          {isLogin ? (
            <p>
              {t("dontHaveAccount")}{" "}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 hover:underline font-medium whitespace-nowrap"
              >
                {t("signUp")}
              </button>
            </p>
          ) : (
            <p>
              {t("alreadyHaveAccount")}{" "}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 hover:underline font-medium whitespace-nowrap"
              >
                {t("signIn")}
              </button>
            </p>
          )}
          <Link
            to="/"
            className="block mt-4 text-sm text-gray-500 hover:text-blue-600 hover:underline whitespace-nowrap"
          >
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
