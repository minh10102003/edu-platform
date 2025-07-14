import { storage } from "../utils/storage.js" // Added .js extension

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const shouldFail = () => Math.random() < 0.1
let _productsCache = null

/**
 * Internal helper: fetch and cache products.json
 */
async function fetchProducts() {
  if (_productsCache === null) {
    const response = await fetch("/api/products.json")
    if (!response.ok) {
      throw new Error("Không thể tải danh sách khóa học")
    }
    _productsCache = await response.json()
  }
  return _productsCache
}

export const api = {
  /**
   * Lấy danh sách tất cả sản phẩm
   */
  getProducts: async () => {
    await delay(500)
    const data = await fetchProducts()
    return { data }
  },

  /**
   * Lấy chi tiết một sản phẩm theo ID
   */
  getProductById: async (id) => {
    await delay(300)
    const products = await fetchProducts()
    const found = products.find((p) => p.id === id) // Assuming ID is already correct type
    if (!found) {
      throw new Error("Không tìm thấy khóa học")
    }
    return { data: found }
  },

  /**
   * Tìm kiếm sản phẩm theo tên hoặc mô tả ngắn
   */
  searchProducts: async (query) => {
    await delay(400)
    const products = await fetchProducts()
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(query.toLowerCase()),
    )
    storage.trackUserAction("search", null, {
      query,
      resultsCount: filtered.length,
    })
    return { data: filtered }
  },

  /**
   * Lọc sản phẩm theo khoảng giá
   */
  filterByPrice: async (minPrice, maxPrice) => {
    await delay(400)
    const products = await fetchProducts()
    const filtered = products.filter((p) => p.price >= minPrice && p.price <= maxPrice)
    return { data: filtered }
  },

  /**
   * Gợi ý AI nâng cao (dùng chung products.json, không cần file riêng)
   */
  getSuggestions: async (userId) => {
    await delay(800)
    if (shouldFail()) {
      throw new Error("AI Service tạm thời không khả dụng")
    }
    const products = await fetchProducts()
    const history = storage.getHistory() || [] // This is view history
    const favoriteIds = storage.getFavorites() || []
    const cartEntries = storage.getCart() || [] // Corrected: use getCart()
    const behavior = storage.getUserBehavior() || {}
    const searchHistory = behavior.searchHistory || []

    const freq = {}
    const recordCategory = (cat) => {
      if (!cat) return
      freq[cat] = (freq[cat] || 0) + 1
    }

    history.forEach((h) => recordCategory(h.product.category)) // Use h.product.category
    favoriteIds.forEach((id) => {
      const p = products.find((x) => x.id === id)
      if (p) recordCategory(p.category)
    })
    cartEntries.forEach((item) => recordCategory(item.product.category)) // Use item.product.category
    searchHistory.forEach((s) => {
      const p = products.find((x) => x.name.toLowerCase().includes(s.query.toLowerCase()))
      if (p) recordCategory(p.category)
    })

    const catsSorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat)

    const topCat = catsSorted[0] || null

    const exclude = new Set([
      ...history.map((h) => h.product.id), // Use h.product.id
      ...favoriteIds,
      ...cartEntries.map((item) => item.product.id), // Use item.product.id
    ])

    let suggestions = []
    if (topCat) {
      suggestions = products.filter((p) => p.category === topCat && !exclude.has(p.id)).slice(0, 5)
    }

    if (suggestions.length < 5) {
      const need = 5 - suggestions.length
      const extra = products
        .filter((p) => !exclude.has(p.id) && (!topCat || p.category !== topCat))
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, need)
      suggestions = suggestions.concat(extra)
    }

    const message = topCat ? `Gợi ý theo danh mục "${topCat}"` : "Gợi ý khóa học phổ biến"
    const confidence = topCat ? Math.min(freq[topCat] / (Object.values(freq).reduce((a, b) => a + b, 0) || 1), 1) : 0.6

    return {
      data: suggestions,
      message,
      confidence,
    }
  },

  /**
   * Content-based filtering suggestions
   */
  getContentBasedSuggestions: async (preferences, history) => {
    // Added async
    const suggestions = []
    const recentlyViewed = history.slice(0, 5).map((h) => h.product)
    const products = await fetchProducts() // Ensure products are fetched
    products.forEach((product) => {
      let score = 0
      if (preferences.preferredCategories.includes(product.category)) score += 0.4
      if (preferences.recentCategories.includes(product.category)) score += 0.3
      const pr = storage.getPriceRange(product.price)
      if (pr === preferences.preferredPriceRange) score += 0.2
      if (product.rating >= preferences.minPreferredRating) score += 0.1
      recentlyViewed.forEach((rv) => {
        if (rv.category === product.category && rv.id !== product.id) score += 0.15
      })
      if (score > 0) suggestions.push({ product, score, algorithm: "content-based" })
    })
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5)
  },

  /**
   * Mock collaborative filtering suggestions
   */
  getCollaborativeFilteringSuggestions: async (userId) => {
    // Added async
    const products = await fetchProducts() // Ensure products are fetched
    const group = Number.parseInt(userId.slice(-1), 10) % 3
    const prefs = {
      0: ["programming", "english"],
      1: ["english", "design"],
      2: ["marketing", "design"],
    }
    const categories = prefs[group] || ["programming"]
    return products
      .filter((p) => categories.includes(p.category))
      .map((product) => ({
        product,
        score: Math.random() * 0.5 + 0.5,
        algorithm: "collaborative",
      }))
      .slice(0, 3)
  },

  /**
   * Trending suggestions (high review count)
   */
  getTrendingSuggestions: async (preferences) => {
    // Added async
    const products = await fetchProducts() // Ensure products are fetched
    return products
      .filter((p) => preferences.preferredCategories.includes(p.category) || p.reviews > 300)
      .map((product) => ({
        product,
        score: (product.reviews / 500) * 0.8,
        algorithm: "trending",
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  },

  /**
   * Popular products for new users
   */
  getPopularProducts: async () => {
    // Added async
    const products = await fetchProducts() // Ensure products are fetched
    return products.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 3)
  },

  /**
   * Lấy sản phẩm theo category
   */
  getProductsByCategory: async (category) => {
    await delay(400)
    const products = await fetchProducts()
    const filtered = products.filter((p) => p.category === category)
    return { data: filtered }
  },

  /**
   * Mock Chatbot Response (re-added)
   */
  getChatbotResponse: async (message, context) => {
    await delay(700) // Simulate network delay
    const products = await fetchProducts()
    let responseMessage = "Tôi không chắc chắn về điều đó. Bạn có thể hỏi rõ hơn không?"
    let productSuggestion = null

    const lowerCaseMessage = message.toLowerCase()

    if (lowerCaseMessage.includes("chào") || lowerCaseMessage.includes("xin chào")) {
      responseMessage = "Chào bạn! Tôi là trợ lý AI của EduCommerce. Tôi có thể giúp gì cho bạn hôm nay?"
    } else if (lowerCaseMessage.includes("khóa học") && lowerCaseMessage.includes("lập trình")) {
      const programmingCourses = products.filter((p) => p.category.toLowerCase() === "programming")
      if (programmingCourses.length > 0) {
        responseMessage = `Chúng tôi có một số khóa học lập trình tuyệt vời như "${programmingCourses[0].name}". Bạn có muốn tìm hiểu thêm không?`
        productSuggestion = programmingCourses[0]
      } else {
        responseMessage =
          "Hiện tại chúng tôi không có khóa học lập trình nào. Bạn có muốn tìm kiếm danh mục khác không?"
      }
    } else if (lowerCaseMessage.includes("giá") || lowerCaseMessage.includes("bao nhiêu")) {
      responseMessage = "Bạn muốn hỏi giá của khóa học nào? Vui lòng cho tôi biết tên khóa học."
    } else if (lowerCaseMessage.includes("cảm ơn")) {
      responseMessage = "Không có gì! Rất vui được giúp đỡ."
    } else if (lowerCaseMessage.includes("giỏ hàng")) {
      responseMessage = `Bạn có ${storage.getCartItemsCount()} sản phẩm trong giỏ hàng.` // Use new storage method
    } else if (lowerCaseMessage.includes("yêu thích")) {
      responseMessage = `Bạn có ${storage.getFavorites().length} sản phẩm yêu thích.`
    } else if (lowerCaseMessage.includes("tất cả khóa học")) {
      responseMessage = `Chúng tôi có tổng cộng ${products.length} khóa học. Bạn có thể xem chúng trên trang chủ.`
    } else {
      responseMessage =
        "Tôi đang học hỏi để hiểu rõ hơn các yêu cầu của bạn. Bạn có thể thử hỏi về một danh mục cụ thể như 'khóa học thiết kế' hoặc 'khóa học tiếng anh' không?"
    }

    return { message: responseMessage, productSuggestion }
  },
}
