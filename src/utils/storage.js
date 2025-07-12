export const storage = {
  // Favorites
  getFavorites: () => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  },
  
  addFavorite: (productId) => {
    const favorites = storage.getFavorites();
    if (!favorites.includes(productId)) {
      favorites.push(productId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      
      // Track favorite action
      storage.trackUserAction('favorite', productId);
    }
    return favorites;
  },
  
  removeFavorite: (productId) => {
    const favorites = storage.getFavorites();
    const filtered = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(filtered));
    return filtered;
  },
  
  isFavorite: (productId) => {
    const favorites = storage.getFavorites();
    return favorites.includes(productId);
  },

  // Cart Management
  getCart: () => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  },

  addToCart: (product) => {
    const cart = storage.getCart();
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      // Tăng số lượng nếu đã tồn tại
      existingItem.quantity += 1;
    } else {
      // Thêm mới vào giỏ
      cart.push({
        product,
        quantity: 1,
        addedAt: Date.now()
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Track cart action
    storage.trackUserAction('addToCart', product.id, { 
      category: product.category, 
      price: product.price 
    });
    
    return cart;
  },

  removeFromCart: (productId) => {
    const cart = storage.getCart();
    const filtered = cart.filter(item => item.product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(filtered));
    return filtered;
  },

  updateCartItemQuantity: (productId, quantity) => {
    const cart = storage.getCart();
    const item = cart.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        // Remove if quantity is 0 or less
        return storage.removeFromCart(productId);
      }
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    return cart;
  },

  getCartTotal: () => {
    const cart = storage.getCart();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  },

  getCartItemsCount: () => {
    const cart = storage.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    return [];
  },

  isInCart: (productId) => {
    const cart = storage.getCart();
    return cart.some(item => item.product.id === productId);
  },

  // History với timestamp và view duration
  getHistory: () => {
    const saved = localStorage.getItem('viewHistory');
    return saved ? JSON.parse(saved) : [];
  },
  
  addToHistory: (product) => {
    const history = storage.getHistory();
    const now = Date.now();
    
    // Find existing entry
    const existingIndex = history.findIndex(h => h.product.id === product.id);
    
    if (existingIndex > -1) {
      // Update view count và last viewed
      history[existingIndex].viewCount++;
      history[existingIndex].lastViewed = now;
      history[existingIndex].totalViewTime += (now - history[existingIndex].lastViewed);
    } else {
      // Add new entry với metadata
      history.unshift({
        product,
        firstViewed: now,
        lastViewed: now,
        viewCount: 1,
        totalViewTime: 0
      });
    }
    
    // Keep last 20 items
    const updated = history.slice(0, 20);
    localStorage.setItem('viewHistory', JSON.stringify(updated));
    
    // Track view action
    storage.trackUserAction('view', product.id, { category: product.category, price: product.price });
    
    return updated;
  },

  // User Behavior Tracking
  getUserBehavior: () => {
    const saved = localStorage.getItem('userBehavior');
    return saved ? JSON.parse(saved) : {
      categoryViews: {},
      priceRangeViews: {},
      totalViews: 0,
      favoriteCategories: {},
      searchHistory: [],
      cartCategories: {},
      lastActive: Date.now()
    };
  },

  trackUserAction: (action, productId, metadata = {}) => {
    const behavior = storage.getUserBehavior();
    
    switch (action) {
      case 'view':
        // Track category views
        if (metadata.category) {
          behavior.categoryViews[metadata.category] = (behavior.categoryViews[metadata.category] || 0) + 1;
        }
        
        // Track price range preferences
        if (metadata.price) {
          const range = storage.getPriceRange(metadata.price);
          behavior.priceRangeViews[range] = (behavior.priceRangeViews[range] || 0) + 1;
        }
        
        behavior.totalViews++;
        break;
        
      case 'favorite': {
        // Track favorite categories
        const history = storage.getHistory();
        const item = history.find(h => h.product.id === productId);
        if (item && item.product.category) {
          behavior.favoriteCategories[item.product.category] = 
            (behavior.favoriteCategories[item.product.category] || 0) + 1;
        }
        break;
      }
      
      case 'addToCart':
        // Track cart categories
        if (metadata.category) {
          behavior.cartCategories[metadata.category] = 
            (behavior.cartCategories[metadata.category] || 0) + 1;
        }
        break;
        
      case 'search':
        // Track search queries
        behavior.searchHistory.push({
          query: metadata.query,
          timestamp: Date.now(),
          resultsCount: metadata.resultsCount
        });
        // Keep last 50 searches
        behavior.searchHistory = behavior.searchHistory.slice(-50);
        break;
    }
    
    behavior.lastActive = Date.now();
    localStorage.setItem('userBehavior', JSON.stringify(behavior));
  },

  getPriceRange: (price) => {
    if (price < 500000) return 'budget';
    if (price <= 1000000) return 'medium';
    return 'premium';
  },

  // Get user preferences based on behavior
  getUserPreferences: () => {
    const behavior = storage.getUserBehavior();
    const history = storage.getHistory();
    const favorites = storage.getFavorites();
    const cart = storage.getCart();
    
    // Calculate preferred categories
    const categoryScores = {};
    Object.entries(behavior.categoryViews).forEach(([cat, views]) => {
      categoryScores[cat] = views * 1; // View weight
    });
    Object.entries(behavior.favoriteCategories).forEach(([cat, count]) => {
      categoryScores[cat] = (categoryScores[cat] || 0) + (count * 3); // Favorite weight
    });
    Object.entries(behavior.cartCategories || {}).forEach(([cat, count]) => {
      categoryScores[cat] = (categoryScores[cat] || 0) + (count * 2); // Cart weight
    });
    
    // Calculate preferred price range
    const priceScores = {};
    Object.entries(behavior.priceRangeViews).forEach(([range, views]) => {
      priceScores[range] = views;
    });
    
    // Calculate average rating preference
    const viewedProducts = history.map(h => h.product);
    const avgRating = viewedProducts.length > 0
      ? viewedProducts.reduce((sum, p) => sum + p.rating, 0) / viewedProducts.length
      : 4.5;
    
    // Get recently viewed categories
    const recentCategories = history
      .slice(0, 5)
      .map(h => h.product.category)
      .filter((cat, index, self) => self.indexOf(cat) === index);
    
    return {
      preferredCategories: Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat),
      preferredPriceRange: Object.entries(priceScores)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medium',
      minPreferredRating: Math.max(avgRating - 0.5, 4.0),
      recentCategories,
      totalInteractions: behavior.totalViews + favorites.length + cart.length,
      isActiveUser: behavior.totalViews > 5 || favorites.length > 2 || cart.length > 0
    };
  },

  // Clear all user data (for testing)
  clearUserData: () => {
    localStorage.removeItem('favorites');
    localStorage.removeItem('viewHistory');
    localStorage.removeItem('userBehavior');
    localStorage.removeItem('cart');
  }
};