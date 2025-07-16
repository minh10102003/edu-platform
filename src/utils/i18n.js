// utils/i18n.js
const translations = {
  vi: {
    // Navigation
    home: "Trang chủ",
    favorites: "Yêu thích",
    history: "Lịch sử",
    cart: "Giỏ hàng",
    login: "Đăng nhập",
    
    // HomePage
    heroTitle: "Khám phá thế giới kiến thức",
    heroSubtitle: "Học tập trực tuyến với hàng nghìn khóa học chất lượng cao từ các chuyên gia hàng đầu",
    getStarted: "Bắt đầu ngay",
    exploreMore: "Khám phá thêm",
    featuredCourses: "Khóa học nổi bật",
    categories: "Danh mục",
    viewAll: "Xem tất cả",
    
    // Product/Course related
    addToCart: "Thêm vào giỏ hàng",
    addToFavorites: "Thêm vào yêu thích",
    removeFromFavorites: "Xóa khỏi yêu thích",
    price: "Giá",
    originalPrice: "Giá gốc",
    rating: "Đánh giá",
    students: "học viên",
    instructor: "Giảng viên",
    
    // Cart
    yourCart: "Giỏ hàng của bạn",
    emptyCart: "Giỏ hàng trống",
    emptyCartMessage: "Bạn chưa có khóa học nào trong giỏ hàng",
    continueShopping: "Tiếp tục mua sắm",
    total: "Tổng cộng",
    checkout: "Thanh toán",
    remove: "Xóa",
    
    // Favorites
    yourFavorites: "Khóa học yêu thích",
    emptyFavorites: "Chưa có khóa học yêu thích",
    emptyFavoritesMessage: "Bạn chưa thêm khóa học nào vào danh sách yêu thích",
    
    // History
    purchaseHistory: "Lịch sử mua hàng",
    emptyHistory: "Chưa có lịch sử mua hàng",
    emptyHistoryMessage: "Bạn chưa mua khóa học nào",
    purchaseDate: "Ngày mua",
    amount: "Số tiền",
    
    // Auth
    signIn: "Đăng nhập",
    signUp: "Đăng ký",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    fullName: "Họ và tên",
    alreadyHaveAccount: "Đã có tài khoản?",
    dontHaveAccount: "Chưa có tài khoản?",
    forgotPassword: "Quên mật khẩu?",
    
    // Footer
    footerDescription: "Nền tảng học tập trực tuyến hàng đầu với hàng nghìn khóa học chất lượng cao từ các chuyên gia trong ngành.",
    quickLinks: "Liên kết nhanh",
    aboutUs: "Về chúng tôi",
    courses: "Khóa học",
    instructors: "Giảng viên",
    blog: "Blog",
    support: "Hỗ trợ",
    privacyPolicy: "Chính sách bảo mật",
    termsOfService: "Điều khoản dịch vụ",
    contact: "Liên hệ",
    faq: "FAQ",
    copyright: "© 2025 EduCommerce. Tất cả quyền được bảo lưu.",
    
    // Common
    loading: "Đang tải...",
    error: "Lỗi",
    success: "Thành công",
    cancel: "Hủy",
    confirm: "Xác nhận",
    save: "Lưu",
    edit: "Chỉnh sửa",
    delete: "Xóa",
    search: "Tìm kiếm",
    filter: "Lọc",
    sort: "Sắp xếp",
    
    // Categories
    programming: "Lập trình",
    design: "Thiết kế",
    business: "Kinh doanh",
    marketing: "Marketing",
    music: "Âm nhạc",
    photography: "Nhiếp ảnh",
    language: "Ngôn ngữ",
    health: "Sức khỏe"
  },
  
  en: {
    // Navigation
    home: "Home",
    favorites: "Favorites",
    history: "History",
    cart: "Cart",
    login: "Login",
    
    // HomePage
    heroTitle: "Discover the World of Knowledge",
    heroSubtitle: "Learn online with thousands of high-quality courses from industry experts",
    getStarted: "Get Started",
    exploreMore: "Explore More",
    featuredCourses: "Featured Courses",
    categories: "Categories",
    viewAll: "View All",
    
    // Product/Course related
    addToCart: "Add to Cart",
    addToFavorites: "Add to Favorites",
    removeFromFavorites: "Remove from Favorites",
    price: "Price",
    originalPrice: "Original Price",
    rating: "Rating",
    students: "students",
    instructor: "Instructor",
    
    // Cart
    yourCart: "Your Cart",
    emptyCart: "Empty Cart",
    emptyCartMessage: "You don't have any courses in your cart",
    continueShopping: "Continue Shopping",
    total: "Total",
    checkout: "Checkout",
    remove: "Remove",
    
    // Favorites
    yourFavorites: "Your Favorites",
    emptyFavorites: "No Favorite Courses",
    emptyFavoritesMessage: "You haven't added any courses to your favorites",
    
    // History
    purchaseHistory: "Purchase History",
    emptyHistory: "No Purchase History",
    emptyHistoryMessage: "You haven't purchased any courses yet",
    purchaseDate: "Purchase Date",
    amount: "Amount",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    forgotPassword: "Forgot Password?",
    
    // Footer
    footerDescription: "Leading online learning platform with thousands of high-quality courses from industry experts.",
    quickLinks: "Quick Links",
    aboutUs: "About Us",
    courses: "Courses",
    instructors: "Instructors",
    blog: "Blog",
    support: "Support",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    contact: "Contact",
    faq: "FAQ",
    copyright: "© 2025 EduCommerce. All rights reserved.",
    
    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    
    // Categories
    programming: "Programming",
    design: "Design",
    business: "Business",
    marketing: "Marketing",
    music: "Music",
    photography: "Photography",
    language: "Language",
    health: "Health"
  }
};

class I18n {
  constructor() {
    this.currentLanguage = this.getStoredLanguage() || 'vi';
    this.listeners = [];
  }

  getStoredLanguage() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('educommerce_language') || 'vi';
    }
    return 'vi';
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLanguage = lang;
      if (typeof window !== 'undefined') {
        localStorage.setItem('educommerce_language', lang);
      }
      this.notifyListeners();
    }
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  t(key, defaultValue = key) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    
    return value || defaultValue;
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }

  getAvailableLanguages() {
    return [
      { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
  }
}

export const i18n = new I18n();
export default i18n;