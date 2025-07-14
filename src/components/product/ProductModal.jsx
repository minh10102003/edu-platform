import { useEffect } from 'react';
import { storage } from '../../utils/storage';

export default function ProductModal({ product, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen && product) storage.addToHistory(product);
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const formatPrice = price =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // split theo 2 newline => từng block paragraph
  const blocks = product.fullDescription.split('\n\n');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Chi tiết khóa học</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <img src={product.image} alt={product.name} className="w-full rounded-lg" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">{product.name}</h3>
              <div className="flex items-center mb-4">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="ml-1 text-lg">{product.rating}</span>
                <span className="text-gray-500 ml-1">({product.reviews} đánh giá)</span>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-4">{formatPrice(product.price)}</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" /* … *//>
                  <span>Giảng viên: <strong>{product.instructor}</strong></span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" /* … *//>
                  <span>Thời lượng: <strong>{product.duration}</strong></span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" /* … *//>
                  <span>Trình độ: <strong>{product.level}</strong></span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-lg mb-2">Mô tả chi tiết:</h4>
                {blocks.map((text, i) => (
                  <p key={i} className="text-gray-700 mb-4">
                    {text}
                  </p>
                ))}
              </div>

              <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold">
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
