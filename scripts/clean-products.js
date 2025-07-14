// scripts/generate-products.js
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, 'public', 'api', 'products.json');

// Một số dữ liệu mẫu để xoay vòng
const categories = ['art', 'business', 'design', 'music', 'programming', 'photography', 'marketing', 'english', 'finance', 'health'];
const levels     = ['Beginner', 'Intermediate', 'Advanced', 'All levels'];
const durations  = ['1 tháng', '2 tháng', '3 tháng', '4 tháng', '5 tháng', '6 tháng'];

const products = Array.from({ length: 50 }, (_, idx) => {
  const id = idx + 1;
  const category = categories[idx % categories.length];
  const level = levels[Math.floor(Math.random() * levels.length)];
  const duration = durations[Math.floor(Math.random() * durations.length)];
  const instructor = `Giảng viên ${id}`;
  const rating = (Math.random() * 2 + 3).toFixed(1); // từ 3.0 đến 5.0
  const reviews = Math.floor(Math.random() * 400 + 50); // từ 50 đến 450
  const price = Math.floor(Math.random() * 1900000 + 100000); // từ 100k đến ~2M
  const name = `Khóa học ${category.charAt(0).toUpperCase() + category.slice(1)}`;
  const shortDescription = `Tham gia khóa học ${category} "${name}" – nâng cao kỹ năng với giảng viên ${instructor}.`;
  const fullDescription = 
    `${name} – Khóa học ${category} dành cho trình độ ${level}, kéo dài ${duration}. ` +
    `Giảng viên: ${instructor} | Đánh giá: ${rating} ⭐ (${reviews} đánh giá). ` +
    `Chi tiết khóa học ${category}, bao gồm lý thuyết và thực hành. ` +
    `Đăng ký ngay để bắt đầu hành trình ${category} của bạn!`;

  return {
    id,
    name,
    price,
    image: `https://picsum.photos/300/200?random=${id}`,
    shortDescription,
    fullDescription,
    rating: Number(rating),
    reviews,
    category,
    instructor,
    duration,
    level
  };
});

// Ghi ra public/api/products.json
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), 'utf8');
console.log(`✔ Đã tạo mới 50 khóa học và ghi ra ${outputPath}`);
