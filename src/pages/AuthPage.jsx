// src/pages/AuthPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

export default function AuthPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // common
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // register only
  const [username, setUsername]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [passwordStrength, setStrength] = useState(0);
  const [errors, setErrors]             = useState({});

  // đánh giá độ mạnh mật khẩu
  const evaluateStrength = pwd => {
    let score = 0;
    if (pwd.length >= 8)      score += 1;
    if (/[A-Z]/.test(pwd))    score += 1;
    if (/[0-9]/.test(pwd))    score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    setStrength(score);
  };

  const handleRegister = () => {
    const existing = storage.findUserByEmail(email);
    if (existing) {
      // email đã có, tự động đăng nhập nếu mật khẩu khớp
      if (existing.password === password) {
        storage.setUser({ username: existing.username, email });
        onAuthSuccess({ username: existing.username, email });
        navigate('/');
      } else {
        alert('Email này đã được đăng ký. Vui lòng nhập đúng mật khẩu để đăng nhập.');
        setMode('login');
      }
      return;
    }

    // nếu chưa có, validate
    const errs = {};
    if (!username.trim()) errs.username = 'Vui lòng nhập tên đăng nhập';
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email không hợp lệ';
    if (password.length < 8) errs.password = 'Mật khẩu phải ≥ 8 ký tự';
    if (!/[A-Z]/.test(password)) errs.password = 'Phải có ít nhất 1 chữ hoa';
    if (!/[0-9]/.test(password)) errs.password = 'Phải có ít nhất 1 số';
    if (!/[^A-Za-z0-9]/.test(password)) errs.password = 'Phải có ít nhất 1 ký tự đặc biệt';
    if (confirmPassword !== password) errs.confirm = 'Không khớp mật khẩu';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    // thêm user mới
    storage.addUser({ username, email, password });
    storage.setUser({ username, email });
    onAuthSuccess({ username, email });
    navigate('/');
  };

  const handleLogin = () => {
    const u = storage.findUserByEmail(email);
    const errs = {};
    if (!u)                errs.email = 'Email không tồn tại';
    else if (u.password !== password) errs.password = 'Sai mật khẩu';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    storage.setUser({ username: u.username, email });
    onAuthSuccess({ username: u.username, email });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-around mb-6">
          <button
            className={`py-2 px-4 ${mode==='login'? 'border-b-2 border-blue-600 font-semibold': 'text-gray-500'}`}
            onClick={() => { setMode('login'); setErrors({}); }}
          >
            Đăng nhập
          </button>
          <button
            className={`py-2 px-4 ${mode==='register'? 'border-b-2 border-blue-600 font-semibold': 'text-gray-500'}`}
            onClick={() => { setMode('register'); setErrors({}); }}
          >
            Đăng ký
          </button>
        </div>

        {mode === 'register' && (
          <label className="block mb-2">
            Tên đăng nhập
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
          </label>
        )}

        <label className="block mb-2">
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </label>

        <label className="block mb-2">
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); evaluateStrength(e.target.value); }}
            className="w-full mt-1 p-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </label>

        {mode === 'register' && (
          <>
            <label className="block mb-2">
              Nhập lại mật khẩu
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirm(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              />
              {errors.confirm && <p className="text-red-500 text-sm">{errors.confirm}</p>}
            </label>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Độ mạnh mật khẩu:</span>
                <span>
                  {['Rất yếu','Yếu','Trung bình','Mạnh'][Math.max(0, passwordStrength-1)] || 'Rất yếu'}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded">
                <div
                  className={`h-2 rounded ${
                    passwordStrength <= 1 ? 'bg-red-500' :
                    passwordStrength === 2 ? 'bg-yellow-500' :
                    passwordStrength === 3 ? 'bg-blue-500' :
                                             'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength/4)*100}%` }}
                />
              </div>
            </div>
          </>
        )}

        <button
          onClick={mode==='login' ? handleLogin : handleRegister}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {mode==='login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </div>
    </div>
  );
}
