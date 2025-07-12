export default function FilterPanel({ onFilterChange }) {
  const priceRanges = [
    { label: 'Tất cả', min: 0, max: Infinity },
    { label: 'Dưới 500K', min: 0, max: 500000 },
    { label: '500K - 1 triệu', min: 500000, max: 1000000 },
    { label: 'Trên 1 triệu', min: 1000000, max: Infinity }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold text-lg mb-3">Lọc theo giá</h3>
      <div className="space-y-2">
        {priceRanges.map((range, index) => (
          <label key={index} className="flex items-center cursor-pointer hover:text-blue-500">
            <input
              type="radio"
              name="priceRange"
              className="mr-2"
              onChange={() => onFilterChange(range.min, range.max)}
            />
            <span>{range.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}