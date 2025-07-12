import { mockProducts } from '../utils/mockData';
import { storage } from '../utils/storage';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate API failure rate (for testing error handling)
const shouldFail = () => Math.random() < 0.1; // 10% failure rate

export const api = {
  // Get all products
  getProducts: async () => {
    await delay(500);
    return { data: mockProducts };
  },

  // Get product by ID
  getProductById: async (id) => {
    await delay(300);
    const product = mockProducts.find(p => p.id === parseInt(id));
    if (!product) throw new Error('Product not found');
    return { data: product };
  },

  // Search products
  searchProducts: async (query) => {
    await delay(400);
    const filtered = mockProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(query.toLowerCase())
    );
    
    // Track search behavior
    storage.trackUserAction('search', null, { 
      query, 
      resultsCount: filtered.length 
    });
    
    return { data: filtered };
  },

  // Filter products by price
  filterByPrice: async (minPrice, maxPrice) => {
    await delay(400);
    const filtered = mockProducts.filter(p => 
      p.price >= minPrice && p.price <= maxPrice
    );
    return { data: filtered };
  },

  // Enhanced AI Suggestions với multiple algorithms
  getSuggestions: async (userId) => {
    await delay(800);
    
    // Simulate API failure cho error handling testing
    if (shouldFail()) {
      throw new Error('AI Service temporarily unavailable');
    }
    
    console.log(`🤖 AI Engine: Processing suggestions for user ${userId}`);
    
    // Get user preferences và behavior
    const preferences = storage.getUserPreferences();
    const history = storage.getHistory();
    const favorites = storage.getFavorites();
    
    console.log('📊 User Profile:', preferences);
    
    // Nếu user mới (chưa có behavior data)
    if (!preferences.isActiveUser) {
      console.log('👤 New user detected - showing popular items');
      return {
        data: api.getPopularProducts(),
        reason: 'popular',
        confidence: 0.6,
        message: 'Khóa học phổ biến dành cho bạn'
      };
    }
    
    // Algorithm 1: Content-based filtering
    const contentBasedSuggestions = api.getContentBasedSuggestions(preferences, history);
    
    // Algorithm 2: Collaborative filtering (mock)
    const collaborativeSuggestions = api.getCollaborativeFilteringSuggestions(userId);
    
    // Algorithm 3: Trending in user's preferred categories
    const trendingSuggestions = api.getTrendingSuggestions(preferences);
    
    // Merge và rank suggestions
    const allSuggestions = [
      ...contentBasedSuggestions.map(s => ({ ...s, score: s.score * 1.2 })), // Boost content-based
      ...collaborativeSuggestions.map(s => ({ ...s, score: s.score * 1.0 })),
      ...trendingSuggestions.map(s => ({ ...s, score: s.score * 0.8 }))
    ];
    
    // Remove duplicates và already viewed/favorited
    const viewedIds = history.map(h => h.product.id);
    const uniqueSuggestions = allSuggestions
      .filter((s, index, self) => 
        self.findIndex(item => item.product.id === s.product.id) === index &&
        !viewedIds.includes(s.product.id) &&
        !favorites.includes(s.product.id)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    // Determine primary reason for suggestions
    let reason = 'mixed';
    let message = 'Gợi ý dành riêng cho bạn';
    
    if (preferences.recentCategories.length > 0) {
      reason = 'recent_interest';
      message = `Vì bạn quan tâm đến ${preferences.recentCategories[0]}`;
    } else if (preferences.preferredCategories.length > 0) {
      reason = 'category_preference';
      message = `Dựa trên sở thích ${preferences.preferredCategories[0]} của bạn`;
    }
    
    return {
      data: uniqueSuggestions.map(s => s.product),
      reason,
      confidence: Math.min(...uniqueSuggestions.map(s => s.score)) || 0.7,
      message,
      debug: {
        totalProducts: mockProducts.length,
        algorithmsUsed: ['content-based', 'collaborative', 'trending'],
        userProfile: preferences
      }
    };
  },

  // Content-based filtering algorithm
  getContentBasedSuggestions: (preferences, history) => {
    const suggestions = [];
    
    // Find products similar to recently viewed
    const recentlyViewed = history.slice(0, 5).map(h => h.product);
    
    mockProducts.forEach(product => {
      let score = 0;
      
      // Category matching
      if (preferences.preferredCategories.includes(product.category)) {
        score += 0.4;
      }
      if (preferences.recentCategories.includes(product.category)) {
        score += 0.3;
      }
      
      // Price range matching
      const productPriceRange = storage.getPriceRange(product.price);
      if (productPriceRange === preferences.preferredPriceRange) {
        score += 0.2;
      }
      
      // Rating matching
      if (product.rating >= preferences.minPreferredRating) {
        score += 0.1;
      }
      
      // Similarity to recently viewed (mock similarity)
      recentlyViewed.forEach(viewed => {
        if (viewed.category === product.category && viewed.id !== product.id) {
          score += 0.15;
        }
      });
      
      if (score > 0) {
        suggestions.push({ product, score, algorithm: 'content-based' });
      }
    });
    
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
  },

  // Mock collaborative filtering
  getCollaborativeFilteringSuggestions: (userId) => {
    // Simulate: "Users who viewed similar products also viewed..."
    const userGroup = parseInt(userId.slice(-1)) % 3; // Mock user grouping
    
    const groupPreferences = {
      0: ['programming', 'english'],
      1: ['english', 'design'],
      2: ['marketing', 'design']
    };
    
    const preferredCategories = groupPreferences[userGroup] || ['programming'];
    
    return mockProducts
      .filter(p => preferredCategories.includes(p.category))
      .map(product => ({
        product,
        score: Math.random() * 0.5 + 0.5, // Random score 0.5-1.0
        algorithm: 'collaborative'
      }))
      .slice(0, 3);
  },

  // Get trending products in categories
  getTrendingSuggestions: (preferences) => {
    // Mock trending products
    return mockProducts
      .filter(p => 
        preferences.preferredCategories.includes(p.category) ||
        p.reviews > 300 // High engagement
      )
      .map(product => ({
        product,
        score: (product.reviews / 500) * 0.8, // Score based on popularity
        algorithm: 'trending'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  },

  // Get popular products for new users
  getPopularProducts: () => {
    return mockProducts
      .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
      .slice(0, 3);
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    await delay(400);
    const filtered = mockProducts.filter(p => p.category === category);
    return { data: filtered };
  }
};