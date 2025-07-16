"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "../../services/api.js"

export default function ChatbotAI({ isOpen, onClose, onProductClick, className }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [allProducts, setAllProducts] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          id: 1,
          text: "Chào bạn! 👋 Tôi là trợ lý AI của EduCommerce. Tôi có thể giúp gì cho bạn hôm nay?",
          sender: "bot",
          timestamp: Date.now(),
        },
      ])
      fetchAllProducts()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchAllProducts = async () => {
    try {
      const productsData = await api.getProducts()
      setAllProducts(productsData.data)
    } catch (error) {
      console.error("Error fetching all products for chatbot:", error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === "" || loading) return

    const userMessage = { id: Date.now(), text: input, sender: "user", timestamp: Date.now() }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    const currentInput = input
    setInput("")
    setLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const response = await api.getChatbotResponse(currentInput, "")
      let responseText = response.message || "Vui lòng chọn một lĩnh vực cụ thể, ví dụ: 'khóa học tiếng anh'."
      
      const botResponse = { 
        id: Date.now() + 1, 
        text: responseText, 
        sender: "bot", 
        timestamp: Date.now() 
      }
      setMessages((prevMessages) => [...prevMessages, botResponse])

      if (response.productSuggestion) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            id: Date.now() + 2, 
            type: "product_card", 
            product: response.productSuggestion, 
            sender: "bot", 
            timestamp: Date.now() 
          },
        ])
      }

    } catch (error) {
      console.error("Chatbot API error:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          id: Date.now() + 1, 
          text: "Có lỗi xảy ra, nhưng đừng lo! Dưới đây là gợi ý khóa học phổ biến.", 
          sender: "bot", 
          timestamp: Date.now() 
        },
      ])
      
      try {
        const defaultResponse = await api.getChatbotResponse("Gợi ý khóa học phổ biến", "")
        const botDefaultResponse = { 
          id: Date.now() + 2, 
          text: defaultResponse.message, 
          sender: "bot", 
          timestamp: Date.now() 
        }
        setMessages((prevMessages) => [...prevMessages, botDefaultResponse])
        
        if (defaultResponse.productSuggestion) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { 
              id: Date.now() + 3, 
              type: "product_card", 
              product: defaultResponse.productSuggestion, 
              sender: "bot", 
              timestamp: Date.now() 
            },
          ])
        }
      } catch (fallbackError) {
        console.error("Fallback error:", fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProductCardClick = (product) => {
    onProductClick(product)
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: `Đã mở chi tiết khóa học "${product.name}" cho bạn! 📚`, sender: "bot", timestamp: Date.now() },
    ])
  }

  const handleQuickAction = (action) => {
    setInput(action)
    inputRef.current?.focus()
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'} flex flex-col`}>
        <div className="bg-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Trợ lý AI</h3>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs opacity-90">Đang trực tuyến</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors" title={isMinimized ? "Mở rộng" : "Thu gọn"}>
              <svg className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors" title="Đóng">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }}>
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 text-center mb-3">Một số gợi ý để bắt đầu:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "Khóa học programming",
                      "Khóa học english",
                      "Khóa học design", 
                      "Khóa học business",
                      "Khóa học art",
                      "Khóa học music",
                      "Khóa học photography",
                      "Khóa học marketing",
                      "Khóa học finance",
                      "Khóa học health",
                      "Bạn đang có những khóa học nào",
                      "Có những khóa học gì",
                      "Cho tôi danh sách các khóa học về tiếng Anh",
                      "Gợi ý khóa học lập trình nào hay",
                      "Tôi muốn xem các khóa học về thiết kế",
                      "Có khóa học nào về kinh doanh không",
                      "Liệt kê các khóa học nhiếp ảnh",
                      "Khóa học marketing nào đang có trên trang web",
                      "Cho tôi xem các khóa học về sức khỏe",
                      "Tôi muốn học về tài chính, có khóa học nào phù hợp",
                      "Gợi ý khóa học nghệ thuật nào tốt",
                      "Có khóa học âm nhạc nào không",
                      "Tôi muốn học cách nói tiếng Anh lưu loát",
                      "Có khóa học nào dạy vẽ tranh hoặc sáng tạo nghệ thuật không",
                      "Tôi muốn học chơi guitar hoặc sáng tác nhạc",
                      "Có khóa học nào dạy viết code hoặc phát triển phần mềm không",
                      "Tôi muốn học thiết kế đồ họa hoặc giao diện web",
                      "Có khóa học nào về khởi nghiệp hoặc quản lý doanh nghiệp không",
                      "Tôi muốn tìm hiểu về dinh dưỡng hoặc chăm sóc sức khỏe",
                      "Có khóa học nào dạy cách quản lý tiền bạc hoặc đầu tư không",
                      "Tôi muốn học chụp ảnh chuyên nghiệp hoặc chỉnh sửa ảnh",
                      "Có khóa học nào về quảng cáo hoặc tiếp thị số không"
                    ].map((suggestion, index) => (
                      <button key={index} onClick={() => handleQuickAction(suggestion)} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-left">
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.sender === "bot" && (
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs">🤖</span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className={`px-4 py-2 rounded-2xl ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-md" : "bg-gray-100 text-gray-800 rounded-bl-md"}`}>
                        {msg.type === "product_card" ? (
                          <ProductCardForChatbot product={msg.product} onProductClick={handleProductCardClick} />
                        ) : (
                          <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
                        )}
                      </div>
                      <span className={`text-xs text-gray-400 mt-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    disabled={loading}
                    maxLength={500}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  title="Gửi tin nhắn"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </form>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">Nhấn Enter để gửi</span>
                <span className="text-xs text-gray-400">{input.length}/500</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ProductCardForChatbot({ product, onProductClick }) {
  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 max-w-xs" onClick={() => onProductClick(product)}>
      <div className="relative">
        <img
          src={`/images/${product.category?.toLowerCase()}.jpg`}
          alt={product.name}
          onError={(e) => { e.currentTarget.src = "/placeholder.svg?height=100&width=200" }}
          className="w-full h-24 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">Gợi ý AI</span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{product.name}</h4>
        <p className="text-gray-600 text-xs line-clamp-2 mb-2">{product.shortDescription}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs text-gray-600">{product.rating}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{product.category}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</span>
          <button className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1">
            Xem chi tiết
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}