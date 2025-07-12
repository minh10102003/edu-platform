import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AISuggestions({ onProductClick, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [reason, setReason] = useState('');
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async (retry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate getting user ID (trong thực tế sẽ từ auth context)
      const userId = `user_${Date.now()}`;
      
      const response = await api.getSuggestions(userId);
      
      setSuggestions(response.data);
      setReason(response.message);
      setConfidence(response.confidence);
      
      // Log debug info
      if (response.debug) {
        console.log('🔍 AI Debug Info:', response.debug);
      }
      
      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      console.error('AI Suggestions Error:', error);
      setError(error.message);
      
      // Auto retry với exponential backoff
      if (retry && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadSuggestions(true);
        }, delay);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (productId) => {
    setSuggestions(suggestions.filter(s => s.id !== productId));
    
    // Animation
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
      card.style.transform = 'translateX(-100%)';
      card.style.opacity = '0';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'Rất phù hợp';
    if (confidence >= 0.6) return 'Phù hợp';
    return 'Có thể bạn thích';
  };

  if (error && !loading) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-red-600">⚠️ Lỗi AI</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-700 mb-4">{error}</p>
        
        <div className="flex gap-3">
          <button
            onClick={() => loadSuggestions(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Thử lại {retryCount > 0 && `(${retryCount}/3)`}
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200 rounded-full -ml-12 -mb-12 opacity-50"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-purple-600">🤖 AI Gợi ý thông minh</span>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{reason}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Confidence indicator */}
            {confidence > 0 && !loading && (
              <div className="text-sm">
                <span className="text-gray-500">Độ chính xác: </span>
                <span className={`font-semibold ${getConfidenceColor(confidence)}`}>
                  {getConfidenceText(confidence)}
                </span>
              </div>
            )}
            
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative">
                <div className="bg-white/50 backdrop-blur animate-pulse h-48 rounded-lg"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((product, index) => (
              <div
                key={product.id}
                data-product-id={product.id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* AI Badge */}
                <div className="absolute top-2 left-2 z-10 flex gap-2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded">
                    🤖 AI Pick
                  </span>
                  <span className="bg-white/90 backdrop-blur text-purple-600 text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                
                {/* Dismiss button */}
                <button
                  onClick={() => handleDismiss(product.id)}
                  className="absolute top-2 right-2 z-10 p-1 bg-white/90 backdrop-blur rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  title="Không quan tâm"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                
                <div className="p-3">
                  <h4 className="font-semibold mb-1 line-clamp-1">{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.shortDescription}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{product.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-purple-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                    </span>
                    <button 
                      onClick={() => onProductClick(product)}
                      className="text-purple-600 hover:text-purple-700 text-sm font-semibold flex items-center gap-1 group"
                    >
                      Chi tiết 
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Actions */}
        {!loading && suggestions.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => loadSuggestions()}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Gợi ý khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}