"use client"

import { useState, useEffect, useRef } from "react"
import { api } from "../../services/api.js" // Assuming api is in src/services/api.js or .ts
import { storage } from "../../utils/storage.js" // Assuming storage is in src/utils/storage.js or .ts
// Removed: import { allProducts } from "../../data/products.js"; or "../public/api/products.json";

export default function ChatbotAI({ onClose, onProductClick, className }) {
  // Thêm className prop
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [allProducts, setAllProducts] = useState([]) // State to store all products
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Initial greeting from chatbot
    setMessages([
      {
        id: 1,
        text: "Chào bạn! Tôi là trợ lý AI của EduCommerce. Tôi có thể giúp gì cho bạn hôm nay?",
        sender: "bot",
      },
    ])

    // Fetch all products when the component mounts
    const fetchAllProducts = async () => {
      try {
        const productsData = await api.getProducts()
        setAllProducts(productsData)
      } catch (error) {
        console.error("Error fetching all products for chatbot:", error)
        // Optionally, add a message to the chat about the error
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 100,
            text: "Xin lỗi, tôi không thể tải dữ liệu sản phẩm lúc này. Một số tính năng có thể bị hạn chế.",
            sender: "bot",
          },
        ])
      }
    }
    fetchAllProducts()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (input.trim() === "") return

    const userMessage = { id: Date.now(), text: input, sender: "user" }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Get user's recent history for context
      const userHistory = storage
        .getHistory()
        .slice(0, 5)
        .map((item) => item.name)
        .join(", ")
      const userCart = storage
        .getCart()
        .map((item) => item.name)
        .join(", ")
      const userFavorites = storage
        .getFavorites()
        .map((id) => allProducts.find((p) => p.id === id)?.name) // Use the fetched allProducts
        .filter(Boolean)
        .join(", ")

      const context = `Người dùng đã xem: ${userHistory}. Giỏ hàng: ${userCart}. Yêu thích: ${userFavorites}.`

      const response = await api.getChatbotResponse(input, context) // Assuming an API call for chatbot response
      const botResponse = { id: Date.now() + 1, text: response.message, sender: "bot" }
      setMessages((prevMessages) => [...prevMessages, botResponse])

      if (response.productSuggestion) {
        // If the bot suggests a product, add it to the messages
        const suggestedProduct = response.productSuggestion
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now() + 2,
            type: "product_card",
            product: suggestedProduct,
            sender: "bot",
          },
        ])
      }
    } catch (error) {
      console.error("Chatbot API error:", error)
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now() + 1,
          text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.",
          sender: "bot",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleProductCardClick = (product) => {
    onProductClick(product) // Open ProductModal from HomePage
    onClose() // Close chatbot modal
  }

  return (
    <div
      className={`bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[70vh] flex flex-col relative mb-20 mr-6 ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 rounded-t-3xl flex items-center justify-between shadow-md">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          Trợ lý AI EduCommerce
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
          aria-label="Close chatbot"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            {msg.sender === "bot" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                🤖
              </div>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"
              }`}
            >
              {msg.type === "product_card" ? (
                <ProductCardForChatbot product={msg.product} onProductClick={handleProductCardClick} />
              ) : (
                <p>{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center mr-3">
              🤖
            </div>
            <div className="bg-gray-200 text-gray-800 p-3 rounded-xl rounded-tl-none shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn của bạn..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          disabled={loading}
        />
        <button
          type="submit"
          className="ml-3 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          disabled={loading}
          aria-label="Send message"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </form>
    </div>
  )
}

// Mini Product Card for Chatbot
function ProductCardForChatbot({ product, onProductClick }) {
  const formatPrice = (price) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onProductClick(product)}
    >
      <img
        src={`/images/${product.category.toLowerCase()}.jpg`}
        alt={product.name}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg?height=100&width=150"
        }}
        className="w-full h-24 object-cover"
      />
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">{product.name}</h4>
        <p className="text-gray-600 text-xs line-clamp-2 mb-2">{product.shortDescription}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-blue-600">{formatPrice(product.price)}</span>
          <button className="text-blue-500 hover:underline text-sm whitespace-nowrap">Xem chi tiết</button>
        </div>
      </div>
    </div>
  )
}
