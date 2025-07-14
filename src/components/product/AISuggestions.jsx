import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { storage } from "../../utils/storage";

export default function AISuggestions({ onProductClick, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [reason, setReason]         = useState("");
  const [confidence, setConfidence] = useState(0);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async (retry = false) => {
    try {
      setLoading(true);
      setError(null);
      const userId = `user_${Date.now()}`;
      storage.trackUserAction("get_suggestions", userId);

      const response = await api.getSuggestions(userId);
      setSuggestions(response.data);
      setReason(response.message);
      setConfidence(response.confidence);
      if (response.debug) console.log("🔍 AI Debug Info:", response.debug);
      setRetryCount(0);
    } catch (err) {
      console.error("AI Suggestions Error:", err);
      setError(err.message);
      if (retry && retryCount < 3) {
        const delayMs = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(c => c + 1);
          loadSuggestions(true);
        }, delayMs);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = (id) => {
    setSuggestions(s => s.filter(p => p.id !== id));
    const card = document.querySelector(`[data-product-id="${id}"]`);
    if (card) {
      card.style.transform = "translateX(-100%)";
      card.style.opacity = "0";
    }
  };

  const getConfidenceColor = (c) =>
    c >= 0.8 ? "text-green-600" :
    c >= 0.6 ? "text-yellow-600" :
               "text-gray-600";

  const getConfidenceText = (c) =>
    c >= 0.8 ? "Rất phù hợp" :
    c >= 0.6 ? "Phù hợp" :
               "Có thể bạn thích";

  if (error && !loading) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-red-600 font-bold">⚠️ Không thể lấy gợi ý lúc này</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <div className="flex gap-3">
          <button
            onClick={() => loadSuggestions(true)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
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
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full -mr-16 -mt-16 opacity-50" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-200 rounded-full -ml-12 -mb-12 opacity-50" />

      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-purple-600">🤖 AI Gợi ý thông minh</span>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600" />
              )}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{reason}</p>
          </div>

          <div className="flex items-center gap-3">
            {!loading && confidence > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Độ chính xác: </span>
                <span className={`font-semibold ${getConfidenceColor(confidence)}`}>
                  {getConfidenceText(confidence)}
                </span>
              </div>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="relative">
                <div className="bg-white/50 backdrop-blur animate-pulse h-48 rounded-lg" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((p, i) => (
              <div
                key={p.id}
                data-product-id={p.id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded">🤖 AI Pick</span>
                  <span className="bg-white/90 backdrop-blur text-purple-600 text-xs px-2 py-1 rounded">#{i+1}</span>
                </div>
                {/* Dismiss */}
                <button
                  onClick={() => handleDismiss(p.id)}
                  className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur rounded-full opacity-0 hover:opacity-100 transition-opacity z-10"
                  title="Không quan tâm"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {/* Image */}
                <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded-t-lg" />
                {/* Details */}
                <div className="p-3">
                  <h4 className="font-semibold mb-1 line-clamp-1">{p.name}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{p.shortDescription}</p>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1">{p.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">{p.category}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-purple-600">
                      {new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(p.price)}
                    </span>
                    <button
                      onClick={() => onProductClick(p)}
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

        {/* Retry Button */}
        {!loading && suggestions.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => loadSuggestions()}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              Gợi ý khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
