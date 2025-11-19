// Like storage utility - localStorage bilan ishlash uchun

const LIKE_STORAGE_KEY = 'liked_books_map';

// Barcha like qilingan kitoblarni olish
export const getLikedBooksMap = () => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(LIKE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Bitta kitobning like holatini olish
export const getBookLikeState = (bookId) => {
  const map = getLikedBooksMap();
  return map[bookId] || null;
};

// Kitobning like holatini saqlash
export const saveBookLikeState = (bookId, isLiked, likeCount) => {
  if (typeof window === 'undefined') return;
  try {
    const map = getLikedBooksMap();
    
    if (isLiked) {
      // Like qilingan bo'lsa saqlash
      map[bookId] = {
        isLiked: true,
        likeCount: likeCount || 1
      };
    } else {
      // Unlike qilingan bo'lsa o'chirish
      delete map[bookId];
    }
    
    localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Error saving like state:', error);
  }
};

// API'dan olingan liked books ro'yxatini saqlash
export const initializeLikedBooksFromAPI = (likedBooks) => {
  if (typeof window === 'undefined') return;
  try {
    const map = {};
    likedBooks.forEach(book => {
      if (book.id) {
        map[book.id] = {
          isLiked: true,
          likeCount: book.like_count || 1
        };
      }
    });
    localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Error initializing liked books:', error);
  }
};

// Barcha like ma'lumotlarini o'chirish (logout uchun)
export const clearLikedBooks = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LIKE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing liked books:', error);
  }
};

// Like qilingan kitoblar sonini olish
export const getLikedBooksCount = () => {
  const map = getLikedBooksMap();
  return Object.keys(map).length;
};

