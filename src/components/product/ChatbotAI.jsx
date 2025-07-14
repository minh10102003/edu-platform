import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { storage } from '../../utils/storage';
import ProductCard from './ProductCard';

export default function ChatbotAI({ onClose }) {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Chào bạn! Mình có thể giúp gì hôm nay?' },
  ]);
  const [input, setInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages(msgs => [...msgs, { type: 'user', text }]);
    setInput('');

    const all = (await api.getProducts()).data;
    const lower = text.toLowerCase();

    if (/khóa học.*nào/.test(lower) || /có.*khóa học/.test(lower) || /các khóa học .*đang có/.test(lower)) {
      const cats = [...new Set(all.map(p => p.category))];
      const pretty = cats.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
      setMessages(msgs => [
        ...msgs,
        { type: 'bot', text: `Hiện tại mình có các danh mục khóa học sau: ${pretty.join(', ')}.` }
      ]);
      return;
    }

    const cats = [...new Set(all.map(p => p.category))];
    const matched = cats.find(cat => lower.includes(cat.toLowerCase()));

    if (matched) {
      setMessages(msgs => [
        ...msgs,
        { type: 'bot', text: `Mình thấy bạn đang quan tâm đến "${matched}". Gợi ý các khóa học liên quan:` },
        { type: 'cards', products: all.filter(p => p.category === matched) },
      ]);
    } else {
      setMessages(msgs => [
        ...msgs,
        { type: 'bot', text: 'Xin lỗi, mình không tìm thấy khóa học phù hợp.' }
      ]);
    }
  };

  const handleViewDetail = product => {
    storage.addToHistory(product);
    setSelectedProduct(product);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="font-semibold">Chatbot AI</h3>
        <button onClick={onClose} className="text-2xl leading-none">×</button>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 bg-gray-50">
        {messages.map((m, i) => (
          m.type === 'user' ? (
            <div key={i} className="text-right">
              <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-lg">
                {m.text}
              </span>
            </div>
          ) : m.type === 'bot' ? (
            <div key={i} className="text-left">
              <span className="inline-block bg-white px-3 py-1 rounded-lg shadow">
                {m.text}
              </span>
            </div>
          ) : m.type === 'cards' ? (
            <div key={i} className="grid grid-cols-1 gap-3">
              {m.products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onViewDetail={handleViewDetail}
                />
              ))}
            </div>
          ) : null
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 bg-white border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Nhập nội dung..."
          className="flex-1 border rounded-lg px-3 py-1 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="bg-red-600 text-white px-4 py-1 rounded-lg hover:bg-red-700 transition-colors"
        >
          Gửi
        </button>
      </div>

      {/* Modal chi tiết */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header modal */}
            <div className="sticky top-0 bg-white px-4 py-2 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Chi tiết khóa học</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            {/* Nội dung modal */}
            <div className="p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full rounded-lg"
                />
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-600 mb-2">{selectedProduct.shortDescription}</p>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500 text-xl">★</span>
                    <span className="ml-1">{selectedProduct.rating}</span>
                    <span className="ml-2 text-gray-500">({selectedProduct.reviews} đánh giá)</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Giảng viên:</strong> {selectedProduct.instructor}</p>
                    <p><strong>Thời lượng:</strong> {selectedProduct.duration}</p>
                    <p><strong>Trình độ:</strong> {selectedProduct.level}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Mô tả chi tiết:</h4>
                <p className="text-gray-800">{selectedProduct.fullDescription}</p>
              </div>
              <button
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                onClick={() => {
                  storage.addToCart(selectedProduct);
                }}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
