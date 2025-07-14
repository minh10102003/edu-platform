export const storage = {
  getFavorites: () => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  },
  
  addFavorite: (productId) => {
    const favorites = storage.getFavorites();
    if (!favorites.includes(productId)) {
      favorites.push(productId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
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
    return storage.getFavorites().includes(productId);
  },

  getCart: () => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  },

  addToCart: (product) => {
    const cart = storage.getCart();
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ product, quantity: 1, addedAt: Date.now() });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    storage.trackUserAction('addToCart', product.id, { category: product.category, price: product.price });
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
    const item = cart.find(i => i.product.id === productId);
    if (item) {
      if (quantity <= 0) return storage.removeFromCart(productId);
      item.quantity = quantity;
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    return cart;
  },

  getCartTotal: () => {
    return storage.getCart().reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  },

  getCartItemsCount: () => {
    return storage.getCart().reduce((c, i) => c + i.quantity, 0);
  },

  clearCart: () => {
    localStorage.removeItem('cart');
    return [];
  },

  isInCart: (productId) => {
    return storage.getCart().some(i => i.product.id === productId);
  },

  getHistory: () => {
    const saved = localStorage.getItem('viewHistory');
    return saved ? JSON.parse(saved) : [];
  },
  
  addToHistory: (product) => {
    const history = storage.getHistory();
    const now = Date.now();
    const idx = history.findIndex(h => h.product.id === product.id);
    if (idx > -1) {
      history[idx].viewCount++;
      history[idx].totalViewTime += now - history[idx].firstViewed;
      history[idx].lastViewed = now;
    } else {
      history.unshift({ product, firstViewed: now, lastViewed: now, viewCount: 1, totalViewTime: 0 });
    }
    const updated = history.slice(0, 20);
    localStorage.setItem('viewHistory', JSON.stringify(updated));
    storage.trackUserAction('view', product.id, { category: product.category, price: product.price });
    return updated;
  },

  getUserBehavior: () => {
    const saved = localStorage.getItem('userBehavior');
    return saved
      ? JSON.parse(saved)
      : { categoryViews: {}, priceRangeViews: {}, totalViews: 0,
          favoriteCategories: {}, searchHistory: [], cartCategories: {}, lastActive: Date.now() };
  },

  trackUserAction: (action, productId, metadata = {}) => {
    const behavior = storage.getUserBehavior();
    switch (action) {
      case 'view':
        if (metadata.category) behavior.categoryViews[metadata.category] = (behavior.categoryViews[metadata.category] || 0) + 1;
        if (metadata.price) {
          const range = storage.getPriceRange(metadata.price);
          behavior.priceRangeViews[range] = (behavior.priceRangeViews[range] || 0) + 1;
        }
        behavior.totalViews++;
        break;
      case 'favorite': {
        const hist = storage.getHistory().find(h => h.product.id === productId);
        if (hist) {
          behavior.favoriteCategories[hist.product.category] = 
            (behavior.favoriteCategories[hist.product.category] || 0) + 1;
        }
        break;
      }
      case 'addToCart':
        if (metadata.category) {
          behavior.cartCategories[metadata.category] = 
            (behavior.cartCategories[metadata.category] || 0) + 1;
        }
        break;
      case 'search':
        behavior.searchHistory.push({
          query: metadata.query,
          timestamp: Date.now(),
          resultsCount: metadata.resultsCount
        });
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

  getUserPreferences: () => {
    const b = storage.getUserBehavior();
    const hist = storage.getHistory();
    const favs = storage.getFavorites();
    const cart = storage.getCart();
    const scores = {};
    Object.entries(b.categoryViews).forEach(([c,v]) => scores[c] = v);
    Object.entries(b.favoriteCategories).forEach(([c,v]) => scores[c] = (scores[c]||0) + v*3);
    Object.entries(b.cartCategories).forEach(([c,v])    => scores[c] = (scores[c]||0) + v*2);
    const priceScores = {};
    Object.entries(b.priceRangeViews).forEach(([r,v]) => priceScores[r] = v);
    const avgRating = hist.length
      ? hist.reduce((sum, h) => sum + h.product.rating, 0) / hist.length
      : 4.5;
    const recentCategories = [...new Set(hist.slice(0,5).map(h => h.product.category))];
    return {
      preferredCategories: Object.entries(scores).sort((a,b) => b[1]-a[1]).slice(0,3).map(([c])=>c),
      preferredPriceRange: Object.entries(priceScores).sort((a,b)=>b[1]-a[1])[0]?.[0]||'medium',
      minPreferredRating: Math.max(avgRating - 0.5, 4.0),
      recentCategories,
      totalInteractions: b.totalViews + favs.length + cart.length,
      isActiveUser: b.totalViews > 5 || favs.length > 2 || cart.length > 0
    };
  },

  clearUserData: () => {
    localStorage.removeItem('favorites');
    localStorage.removeItem('viewHistory');
    localStorage.removeItem('userBehavior');
    localStorage.removeItem('cart');
  },

  getAllUsers: () => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  },

  findUserByEmail: (email) => {
    return storage.getAllUsers().find(u => u.email === email) || null;
  },

  addUser: ({ username, email, password }) => {
    const list = storage.getAllUsers();
    list.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(list));
    return list;
  },

  setUser: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  getUser: () => {
    const u = localStorage.getItem('currentUser');
    return u ? JSON.parse(u) : null;
  },

  clearUser: () => {
    localStorage.removeItem('currentUser');
  }
};
