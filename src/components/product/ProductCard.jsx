import { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';

export default function ProductCard({
  product,
  onViewDetail,
  onToggleFavorite
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(storage.isFavorite(product.id));
  }, [product.id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const newFav = !isFavorite;

    if (newFav) storage.addFavorite(product.id);
    else storage.removeFavorite(product.id);

    setIsFavorite(newFav);
    onToggleFavorite(product.id, newFav);

    showToast(newFav ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích');
  };

  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-up';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Chuyển chữ hoa chữ cái đầu
  const capitalize = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
          } hover:scale-110 transition-transform`}
        >
          <svg className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription}</p>
        
        <div className="flex items-center mb-3">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-sm">{product.rating}</span>
          <span className="text-gray-400 text-sm ml-1">({product.reviews} đánh giá)</span>
          {/* Tag nhỏ nằm ngang với rating */}
          <span className="ml-auto text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {capitalize(product.category)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-blue-600">{formatPrice(product.price)}</span>
          <button
            onClick={() => onViewDetail(product)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
