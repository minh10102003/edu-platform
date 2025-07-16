import { storage } from "../utils/storage.js"

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const shouldFail = () => Math.random() < 0.1
let _productsCache = null

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
  getProducts: async () => {
    await delay(500)
    const data = await fetchProducts()
    return { data }
  },

  getProductById: async (id) => {
    await delay(300)
    const products = await fetchProducts()
    const found = products.find((p) => p.id === id)
    if (!found) {
      throw new Error("Không tìm thấy khóa học")
    }
    return { data: found }
  },

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

  filterByPrice: async (minPrice, maxPrice) => {
    await delay(400)
    const products = await fetchProducts()
    const filtered = products.filter((p) => p.price >= minPrice && p.price <= maxPrice)
    return { data: filtered }
  },

  getSuggestions: async () => {
    await delay(800)
    if (shouldFail()) {
      throw new Error("AI Service tạm thời không khả dụng")
    }
    const products = await fetchProducts()
    const history = storage.getHistory() || []
    const favoriteIds = storage.getFavorites() || []
    const cartEntries = storage.getCart() || []
    const behavior = storage.getUserBehavior() || {}
    const searchHistory = behavior.searchHistory || []

    const freq = {}
    const recordCategory = (cat) => {
      if (!cat) return
      freq[cat] = (freq[cat] || 0) + 1
    }

    history.forEach((h) => recordCategory(h.product.category))
    favoriteIds.forEach((id) => {
      const p = products.find((x) => x.id === id)
      if (p) recordCategory(p.category)
    })
    cartEntries.forEach((item) => recordCategory(item.product.category))
    searchHistory.forEach((s) => {
      const p = products.find((x) => x.name.toLowerCase().includes(s.query.toLowerCase()))
      if (p) recordCategory(p.category)
    })

    const catsSorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat)

    const topCat = catsSorted[0] || null

    const exclude = new Set([
      ...history.map((h) => h.product.id),
      ...favoriteIds,
      ...cartEntries.map((item) => item.product.id),
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

  getContentBasedSuggestions: async (preferences, history) => {
    const suggestions = []
    const recentlyViewed = history.slice(0, 5).map((h) => h.product)
    const products = await fetchProducts()
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

  getCollaborativeFilteringSuggestions: async (userId) => {
    const products = await fetchProducts()
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

  getTrendingSuggestions: async (preferences) => {
    const products = await fetchProducts()
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

  getPopularProducts: async () => {
    const products = await fetchProducts()
    return products.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews).slice(0, 3)
  },

  getProductsByCategory: async (category) => {
    await delay(400)
    const products = await fetchProducts()
    const filtered = products.filter((p) => p.category.toLowerCase() === category.toLowerCase())
    return { data: filtered }
  },

  getChatbotResponse: async (message) => {
    await delay(700)
    const products = await fetchProducts()
    let responseMessage = ""
    let productSuggestion = null

    const lowerCaseMessage = message.toLowerCase()
    const allCategories = [...new Set(products.map(p => p.category.toLowerCase()))]

    // XỬ LÝ CÁC PATTERN KHÓA HỌC CỤ THỂ
    // Pattern 1: "khóa học [exact_tag]"
    const exactTagPattern = /khóa học\s+(art|business|design|music|programming|photography|marketing|english|finance|health)/i
    let match = lowerCaseMessage.match(exactTagPattern)
    
    if (match) {
      const requestedTag = match[1].toLowerCase()
      const courses = products.filter(p => p.category.toLowerCase() === requestedTag)
      if (courses.length > 0) {
        responseMessage = `Danh sách các khóa học ${requestedTag} (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { 
            style: "currency", 
            currency: "VND", 
            minimumFractionDigits: 0 
          }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
        return { message: responseMessage, productSuggestion }
      } else {
        responseMessage = `Hiện tại không có khóa học ${requestedTag} nào.`
        return { message: responseMessage, productSuggestion }
      }
    }

    // Pattern 2: "khóa học [vietnamese_keywords]"
    const vietnameseKeywords = {
      'tiếng anh': 'english',
      'anh ngữ': 'english',
      'kinh doanh': 'business', 
      'lập trình': 'programming',
      'thiết kế': 'design',
      'nghệ thuật': 'art',
      'âm nhạc': 'music',
      'nhiếp ảnh': 'photography',
      'tiếp thị': 'marketing',
      'tài chính': 'finance',
      'sức khỏe': 'health'
    }

    for (const [vietnameseKey, englishTag] of Object.entries(vietnameseKeywords)) {
      if (lowerCaseMessage.includes(`khóa học ${vietnameseKey}`)) {
        const courses = products.filter(p => p.category.toLowerCase() === englishTag)
        if (courses.length > 0) {
          responseMessage = `Danh sách các khóa học ${englishTag} (${courses.length} khóa học):`
          courses.forEach((course, index) => {
            const price = new Intl.NumberFormat("vi-VN", { 
              style: "currency", 
              currency: "VND", 
              minimumFractionDigits: 0 
            }).format(course.price)
            responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
          })
          productSuggestion = courses[0]
          return { message: responseMessage, productSuggestion }
        } else {
          responseMessage = `Hiện tại không có khóa học ${englishTag} nào.`
          return { message: responseMessage, productSuggestion }
        }
      }
    }

    // XỬ LÝ CÁC CÂU HỎI VỀ DANH SÁCH KHÓA HỌC CÓ SẴN
    if (lowerCaseMessage.includes("bạn đang có những khóa học nào") || 
        lowerCaseMessage.includes("các khóa học đang có") ||
        lowerCaseMessage.includes("có những khóa học gì") ||
        lowerCaseMessage.includes("tất cả khóa học") || 
        lowerCaseMessage.includes("khóa học bạn đang có") || 
        lowerCaseMessage.includes("gợi ý các khóa học bạn đang có") ||
        lowerCaseMessage.includes("danh sách khóa học") ||
        lowerCaseMessage.includes("những khóa học nào")) {
      
      const categoriesWithCount = allCategories.map(cat => {
        const count = products.filter(p => p.category.toLowerCase() === cat).length
        return `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${count} khóa học`
      })
      
      responseMessage = `Hiện tại chúng tôi có các danh mục khóa học sau:\n\n${categoriesWithCount.join('\n')}\n\nTổng cộng: ${products.length} khóa học\n\nHãy hỏi cụ thể về danh mục bạn quan tâm, ví dụ: "khóa học programming"`
      
      // Gợi ý khóa học phổ biến nhất
      const popularCourse = products.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)[0]
      if (popularCourse) {
        productSuggestion = popularCourse
      }
      
      return { message: responseMessage, productSuggestion }
    }

    // XỬ LÝ CÁC CÂU HỎI KHÁC
    if (lowerCaseMessage.includes("chào") || lowerCaseMessage.includes("xin chào")) {
      responseMessage = "Chào bạn! 👋 Tôi là trợ lý AI của EduCommerce. Tôi có thể giúp gì cho bạn hôm nay?"
    } else if (lowerCaseMessage.includes("cho tôi danh sách các khóa học về tiếng anh")) {
      const courses = products.filter(p => p.category.toLowerCase() === "english")
      if (courses.length > 0) {
        responseMessage = `Danh sách các khóa học tiếng Anh (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học tiếng Anh nào."
      }
    } else if (lowerCaseMessage.includes("gợi ý khóa học lập trình nào hay")) {
      const courses = products.filter(p => p.category.toLowerCase() === "programming")
      if (courses.length > 0) {
        responseMessage = `Danh sách khóa học lập trình hay (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học lập trình nào."
      }
    } else if (lowerCaseMessage.includes("tôi muốn xem các khóa học về thiết kế")) {
      const courses = products.filter(p => p.category.toLowerCase() === "design")
      if (courses.length > 0) {
        responseMessage = `Các khóa học thiết kế (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học thiết kế nào."
      }
    } else if (lowerCaseMessage.includes("có khóa học nào về kinh doanh không")) {
      const courses = products.filter(p => p.category.toLowerCase() === "business")
      if (courses.length > 0) {
        responseMessage = `Có, danh sách khóa học kinh doanh (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học kinh doanh nào."
      }
    } else if (lowerCaseMessage.includes("liệt kê các khóa học nhiếp ảnh")) {
      const courses = products.filter(p => p.category.toLowerCase() === "photography")
      if (courses.length > 0) {
        responseMessage = `Danh sách khóa học nhiếp ảnh (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học nhiếp ảnh nào."
      }
    } else if (lowerCaseMessage.includes("khóa học marketing nào đang có trên trang web")) {
      const courses = products.filter(p => p.category.toLowerCase() === "marketing")
      if (courses.length > 0) {
        responseMessage = `Khóa học marketing đang có (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học marketing nào."
      }
    } else if (lowerCaseMessage.includes("cho tôi xem các khóa học về sức khỏe")) {
      const courses = products.filter(p => p.category.toLowerCase() === "health")
      if (courses.length > 0) {
        responseMessage = `Các khóa học sức khỏe (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học sức khỏe nào."
      }
    } else if (lowerCaseMessage.includes("tôi muốn học về tài chính, có khóa học nào phù hợp")) {
      const courses = products.filter(p => p.category.toLowerCase() === "finance")
      if (courses.length > 0) {
        responseMessage = `Khóa học tài chính phù hợp (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học tài chính nào."
      }
    } else if (lowerCaseMessage.includes("gợi ý khóa học nghệ thuật nào tốt")) {
      const courses = products.filter(p => p.category.toLowerCase() === "art")
      if (courses.length > 0) {
        responseMessage = `Gợi ý khóa học nghệ thuật tốt (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học nghệ thuật nào."
      }
    } else if (lowerCaseMessage.includes("có khóa học âm nhạc nào không")) {
      const courses = products.filter(p => p.category.toLowerCase() === "music")
      if (courses.length > 0) {
        responseMessage = `Có, danh sách khóa học âm nhạc (${courses.length} khóa học):`
        courses.forEach((course, index) => {
          const price = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(course.price)
          responseMessage += `\n${index + 1}. "${course.name}" - ${price}`
        })
        productSuggestion = courses[0]
      } else {
        responseMessage = "Hiện tại không có khóa học âm nhạc nào."
      }
    } else if (lowerCaseMessage.includes("giá") || lowerCaseMessage.includes("bao nhiêu")) {
      responseMessage = "Bạn muốn hỏi giá của khóa học nào? Vui lòng cho tôi biết tên khóa học hoặc danh mục."
    } else if (lowerCaseMessage.includes("cảm ơn")) {
      responseMessage = "Không có gì! Rất vui được giúp đỡ bạn. 😊"
    } else if (lowerCaseMessage.includes("giỏ hàng")) {
      responseMessage = `Bạn có ${storage.getCartItemsCount()} sản phẩm trong giỏ hàng.`
    } else if (lowerCaseMessage.includes("yêu thích")) {
      responseMessage = `Bạn có ${storage.getFavorites().length} sản phẩm yêu thích.`
    } else {
      // Câu trả lời mặc định với gợi ý
      responseMessage = "Tôi có thể giúp bạn tìm khóa học theo các danh mục sau:\n\n" + 
        allCategories.map(cat => `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}`).join('\n') + 
        "\n\nVí dụ: 'khóa học programming' hoặc 'khóa học tiếng anh'"
      
      // Gợi ý khóa học phổ biến
      const popularCourses = products.sort((a, b) => b.rating * b.reviews - a.rating * a.reviews)
      if (popularCourses.length > 0) {
        productSuggestion = popularCourses[0]
      }
    }

    return { message: responseMessage, productSuggestion }
  },
}