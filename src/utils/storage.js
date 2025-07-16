export const storage = {
  // Favorites Management
  getFavorites: () => {
    try {
      const saved = localStorage.getItem("favorites")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error getting favorites:", error)
      return []
    }
  },

  addFavorite: (productId) => {
    try {
      const favorites = storage.getFavorites()
      if (!favorites.includes(productId)) {
        favorites.push(productId)
        localStorage.setItem("favorites", JSON.stringify(favorites))
        storage.trackUserAction("favorite", productId)
      }
      return favorites
    } catch (error) {
      console.error("Error adding favorite:", error)
      return storage.getFavorites()
    }
  },

  removeFavorite: (productId) => {
    try {
      const favorites = storage.getFavorites()
      const filtered = favorites.filter((id) => id !== productId)
      localStorage.setItem("favorites", JSON.stringify(filtered))
      return filtered
    } catch (error) {
      console.error("Error removing favorite:", error)
      return storage.getFavorites()
    }
  },

  isFavorite: (productId) => {
    return storage.getFavorites().includes(productId)
  },

  clearFavorites: () => {
    try {
      localStorage.removeItem("favorites")
      return []
    } catch (error) {
      console.error("Error clearing favorites:", error)
      return []
    }
  },

  // Cart Management (Optimized for Online Courses)
  getCart: () => {
    try {
      const saved = localStorage.getItem("cart")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error getting cart:", error)
      return []
    }
  },

  addToCart: (product) => {
    try {
      const cart = storage.getCart()
      
      // For online courses, we don't need quantity - each course is unique
      const existingItem = cart.find((item) => item.product.id === product.id)
      if (existingItem) {
        // Course already in cart, don't add duplicate
        return cart
      }
      
      // Add new course to cart
      cart.push({ 
        product, 
        addedAt: Date.now(),
        quantity: 1 // Keep quantity for compatibility but always 1 for courses
      })
      
      localStorage.setItem("cart", JSON.stringify(cart))
      storage.trackUserAction("addToCart", product.id, { 
        category: product.category, 
        price: product.price 
      })
      return cart
    } catch (error) {
      console.error("Error adding to cart:", error)
      return storage.getCart()
    }
  },

  removeFromCart: (productId) => {
    try {
      const cart = storage.getCart()
      const filtered = cart.filter((item) => item.product.id !== productId)
      localStorage.setItem("cart", JSON.stringify(filtered))
      return filtered
    } catch (error) {
      console.error("Error removing from cart:", error)
      return storage.getCart()
    }
  },

  // Legacy method for compatibility - not needed for courses but kept for existing code
  updateCartItemQuantity: (productId, quantity) => {
    try {
      const cart = storage.getCart()
      const item = cart.find((i) => i.product.id === productId)
      if (item) {
        if (quantity <= 0) return storage.removeFromCart(productId)
        // For courses, quantity should always be 1, but update for compatibility
        item.quantity = Math.min(quantity, 1) // Max 1 for courses
        localStorage.setItem("cart", JSON.stringify(cart))
      }
      return cart
    } catch (error) {
      console.error("Error updating cart quantity:", error)
      return storage.getCart()
    }
  },

  getCartTotal: () => {
    try {
      return storage.getCart().reduce((sum, item) => sum + item.product.price, 0)
    } catch (error) {
      console.error("Error calculating cart total:", error)
      return 0
    }
  },

  getCartItemsCount: () => {
    try {
      return storage.getCart().length // For courses, count is just number of unique courses
    } catch (error) {
      console.error("Error getting cart count:", error)
      return 0
    }
  },

  clearCart: () => {
    try {
      localStorage.removeItem("cart")
      return []
    } catch (error) {
      console.error("Error clearing cart:", error)
      return []
    }
  },

  isInCart: (productId) => {
    try {
      return storage.getCart().some((item) => item.product.id === productId)
    } catch (error) {
      console.error("Error checking if in cart:", error)
      return false
    }
  },

  // View History Management
  getHistory: () => {
    try {
      const saved = localStorage.getItem("viewHistory")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error getting history:", error)
      return []
    }
  },

  addToHistory: (product) => {
    try {
      const history = storage.getHistory()
      const now = Date.now()
      const existingIndex = history.findIndex((h) => h.product.id === product.id)
      
      if (existingIndex > -1) {
        // Update existing entry
        const existingItem = history[existingIndex]
        existingItem.viewCount++
        existingItem.totalViewTime += (now - existingItem.lastViewed) // Rough estimate
        existingItem.lastViewed = now
        
        // Move to front
        history.splice(existingIndex, 1)
        history.unshift(existingItem)
      } else {
        // Add new entry
        history.unshift({ 
          product, 
          firstViewed: now, 
          lastViewed: now, 
          viewCount: 1, 
          totalViewTime: 0 
        })
      }
      
      // Keep only recent 50 items
      const updated = history.slice(0, 50)
      localStorage.setItem("viewHistory", JSON.stringify(updated))
      storage.trackUserAction("view", product.id, { 
        category: product.category, 
        price: product.price 
      })
      return updated
    } catch (error) {
      console.error("Error adding to history:", error)
      return storage.getHistory()
    }
  },

  clearHistory: () => {
    try {
      localStorage.removeItem("viewHistory")
      return []
    } catch (error) {
      console.error("Error clearing history:", error)
      return []
    }
  },

  // User Behavior Tracking
  getUserBehavior: () => {
    try {
      const saved = localStorage.getItem("userBehavior")
      return saved ? JSON.parse(saved) : {
        categoryViews: {},
        priceRangeViews: {},
        totalViews: 0,
        favoriteCategories: {},
        searchHistory: [],
        cartCategories: {},
        lastActive: Date.now(),
        enrolledCourses: [], // Track completed enrollments
        completedCourses: [], // Track course completions
        studyTime: 0, // Track total study time
        achievements: [] // Track learning achievements
      }
    } catch (error) {
      console.error("Error getting user behavior:", error)
      return {
        categoryViews: {},
        priceRangeViews: {},
        totalViews: 0,
        favoriteCategories: {},
        searchHistory: [],
        cartCategories: {},
        lastActive: Date.now(),
        enrolledCourses: [],
        completedCourses: [],
        studyTime: 0,
        achievements: []
      }
    }
  },

  trackUserAction: (action, productId, metadata = {}) => {
    try {
      const behavior = storage.getUserBehavior()
      
      switch (action) {
        case "view":
          if (metadata.category) {
            behavior.categoryViews[metadata.category] = (behavior.categoryViews[metadata.category] || 0) + 1
          }
          if (metadata.price) {
            const range = storage.getPriceRange(metadata.price)
            behavior.priceRangeViews[range] = (behavior.priceRangeViews[range] || 0) + 1
          }
          behavior.totalViews++
          break
          
        case "favorite":
          if (metadata.category) {
            behavior.favoriteCategories[metadata.category] = (behavior.favoriteCategories[metadata.category] || 0) + 1
          } else {
            // Try to get category from history
            const histItem = storage.getHistory().find((h) => h.product.id === productId)
            if (histItem?.product?.category) {
              behavior.favoriteCategories[histItem.product.category] = 
                (behavior.favoriteCategories[histItem.product.category] || 0) + 1
            }
          }
          break
          
        case "addToCart":
          if (metadata.category) {
            behavior.cartCategories[metadata.category] = (behavior.cartCategories[metadata.category] || 0) + 1
          }
          break
          
        case "search":
          behavior.searchHistory.push({
            query: metadata.query,
            timestamp: Date.now(),
            resultsCount: metadata.resultsCount || 0,
          })
          behavior.searchHistory = behavior.searchHistory.slice(-100) // Keep last 100 searches
          break
          
        case "enroll":
          if (!behavior.enrolledCourses.includes(productId)) {
            behavior.enrolledCourses.push(productId)
          }
          break
          
        case "complete":
          if (!behavior.completedCourses.includes(productId)) {
            behavior.completedCourses.push(productId)
            // Add achievement for course completion
            behavior.achievements.push({
              type: "course_completion",
              courseId: productId,
              timestamp: Date.now()
            })
          }
          break
          
        case "study_time":
          behavior.studyTime += (metadata.duration || 0)
          break
      }
      
      behavior.lastActive = Date.now()
      localStorage.setItem("userBehavior", JSON.stringify(behavior))
    } catch (error) {
      console.error("Error tracking user action:", error)
    }
  },

  getPriceRange: (price) => {
    if (price === 0) return "free"
    if (price < 500000) return "budget"
    if (price <= 1000000) return "medium"
    if (price <= 2000000) return "premium"
    return "enterprise"
  },

  getUserPreferences: () => {
    try {
      const behavior = storage.getUserBehavior()
      const history = storage.getHistory()
      const favorites = storage.getFavorites()
      const cart = storage.getCart()
      
      // Calculate category preferences with weighted scoring
      const categoryScores = {}
      
      // Weight different actions differently
      Object.entries(behavior.categoryViews).forEach(([category, views]) => {
        categoryScores[category] = (categoryScores[category] || 0) + views * 1
      })
      
      Object.entries(behavior.favoriteCategories).forEach(([category, count]) => {
        categoryScores[category] = (categoryScores[category] || 0) + count * 5 // Favorites weighted more
      })
      
      Object.entries(behavior.cartCategories).forEach(([category, count]) => {
        categoryScores[category] = (categoryScores[category] || 0) + count * 3 // Cart items weighted moderately
      })
      
      // Price range preferences
      const priceScores = {}
      Object.entries(behavior.priceRangeViews).forEach(([range, views]) => {
        priceScores[range] = views
      })
      
      // Calculate average rating preference from viewed products
      const avgRating = history.length 
        ? history.reduce((sum, h) => sum + (h.product.rating || 4.5), 0) / history.length 
        : 4.5
      
      // Recent categories from last 10 views
      const recentCategories = [...new Set(history.slice(0, 10).map((h) => h.product.category))]
      
      // Learning progress metrics
      const enrollmentRate = behavior.enrolledCourses.length / Math.max(behavior.totalViews, 1)
      const completionRate = behavior.completedCourses.length / Math.max(behavior.enrolledCourses.length, 1)
      
      return {
        preferredCategories: Object.entries(categoryScores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([category]) => category),
        preferredPriceRange: Object.entries(priceScores)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || "medium",
        minPreferredRating: Math.max(avgRating - 0.5, 3.5),
        recentCategories,
        totalInteractions: behavior.totalViews + favorites.length + cart.length,
        isActiveUser: behavior.totalViews > 5 || favorites.length > 2 || cart.length > 0,
        learningMetrics: {
          enrollmentRate: Number(enrollmentRate.toFixed(2)),
          completionRate: Number(completionRate.toFixed(2)),
          totalStudyTime: behavior.studyTime,
          coursesEnrolled: behavior.enrolledCourses.length,
          coursesCompleted: behavior.completedCourses.length,
          achievements: behavior.achievements.length
        },
        userLevel: storage.getUserLevel(behavior)
      }
    } catch (error) {
      console.error("Error getting user preferences:", error)
      return {
        preferredCategories: [],
        preferredPriceRange: "medium",
        minPreferredRating: 4.0,
        recentCategories: [],
        totalInteractions: 0,
        isActiveUser: false,
        learningMetrics: {
          enrollmentRate: 0,
          completionRate: 0,
          totalStudyTime: 0,
          coursesEnrolled: 0,
          coursesCompleted: 0,
          achievements: 0
        },
        userLevel: "beginner"
      }
    }
  },

  getUserLevel: (behavior) => {
    const completed = behavior.completedCourses?.length || 0
    const studyHours = (behavior.studyTime || 0) / (1000 * 60 * 60) // Convert to hours
    const totalViews = behavior.totalViews || 0
    
    if (completed >= 10 && studyHours >= 100) return "expert"
    if (completed >= 5 && studyHours >= 50) return "advanced"
    if (completed >= 2 && studyHours >= 20) return "intermediate"
    if (totalViews >= 10 || completed >= 1) return "beginner"
    return "newcomer"
  },

  // Promo Code Management
  getUsedPromoCodes: () => {
    try {
      const saved = localStorage.getItem("usedPromoCodes")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error getting used promo codes:", error)
      return []
    }
  },

  addUsedPromoCode: (code) => {
    try {
      const used = storage.getUsedPromoCodes()
      if (!used.includes(code)) {
        used.push(code)
        localStorage.setItem("usedPromoCodes", JSON.stringify(used))
      }
      return used
    } catch (error) {
      console.error("Error adding used promo code:", error)
      return storage.getUsedPromoCodes()
    }
  },

  // User Management
  getAllUsers: () => {
    try {
      const saved = localStorage.getItem("users")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error getting users:", error)
      return []
    }
  },

  findUserByEmail: (email) => {
    try {
      return storage.getAllUsers().find((u) => u.email === email) || null
    } catch (error) {
      console.error("Error finding user by email:", error)
      return null
    }
  },

  addUser: ({ username, email, password }) => {
    try {
      const users = storage.getAllUsers()
      const newUser = {
        id: Date.now(),
        username,
        email,
        password,
        createdAt: Date.now(),
        profile: {
          avatar: null,
          bio: "",
          interests: [],
          learningGoals: []
        }
      }
      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))
      return users
    } catch (error) {
      console.error("Error adding user:", error)
      return storage.getAllUsers()
    }
  },

  setUser: (user) => {
    try {
      localStorage.setItem("currentUser", JSON.stringify(user))
    } catch (error) {
      console.error("Error setting current user:", error)
    }
  },

  getUser: () => {
    try {
      const saved = localStorage.getItem("currentUser")
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem("currentUser")
    } catch (error) {
      console.error("Error clearing current user:", error)
    }
  },

  // Data Management
  clearUserData: () => {
    try {
      const keysToRemove = [
        "favorites",
        "viewHistory", 
        "userBehavior",
        "cart",
        "usedPromoCodes"
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      return true
    } catch (error) {
      console.error("Error clearing user data:", error)
      return false
    }
  },

  clearAllData: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error("Error clearing all data:", error)
      return false
    }
  },

  // Export/Import functionality for data portability
  exportUserData: () => {
    try {
      const data = {
        favorites: storage.getFavorites(),
        cart: storage.getCart(),
        history: storage.getHistory(),
        behavior: storage.getUserBehavior(),
        user: storage.getUser(),
        usedPromoCodes: storage.getUsedPromoCodes(),
        exportDate: new Date().toISOString()
      }
      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error("Error exporting user data:", error)
      return null
    }
  },

  importUserData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.favorites) {
        localStorage.setItem("favorites", JSON.stringify(data.favorites))
      }
      if (data.cart) {
        localStorage.setItem("cart", JSON.stringify(data.cart))
      }
      if (data.history) {
        localStorage.setItem("viewHistory", JSON.stringify(data.history))
      }
      if (data.behavior) {
        localStorage.setItem("userBehavior", JSON.stringify(data.behavior))
      }
      if (data.user) {
        localStorage.setItem("currentUser", JSON.stringify(data.user))
      }
      if (data.usedPromoCodes) {
        localStorage.setItem("usedPromoCodes", JSON.stringify(data.usedPromoCodes))
      }
      
      return true
    } catch (error) {
      console.error("Error importing user data:", error)
      return false
    }
  }
}