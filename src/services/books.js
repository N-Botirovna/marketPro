import http from "@/lib/http";

// Get books with all filtering options
export async function getBooks(params = {}) {
  const { data } = await http.get("api/v1/book/list", { params });
  return {
    books: data?.results || [],
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    raw: data,
  };
}

// Get single book by ID
export async function getBookById(id) {
  const { data } = await http.get(`api/v1/book/${id}`);
  return {
    book: data || null,
    raw: data,
  };
}

// Get books for homepage
export async function getHomePageBooks() {
  return await getBooks({ 
    for_home_page: true, 
    is_active: true, 
    limit: 12 
  });
}

// Get new books
export async function getNewBooks(limit = 8) {
  return await getBooks({ 
    is_active: true, 
    ordering: '-created_at',
    limit 
  });
}

// Get used books
export async function getUsedBooks(limit = 8) {
  return await getBooks({ 
    is_active: true, 
    is_used: true,
    limit 
  });
}

// Get books by category
export async function getBooksByCategory(categoryId, limit = 12) {
  return await getBooks({ 
    category: categoryId,
    is_active: true, 
    limit 
  });
}

// Get books by type (gift, exchange, seller)
export async function getBooksByType(type, limit = 12) {
  return await getBooks({ 
    type,
    is_active: true, 
    limit 
  });
}

// Search books
export async function searchBooks(query, params = {}) {
  return await getBooks({ 
    q: query,
    is_active: true,
    ...params 
  });
}

// Get books by price range
export async function getBooksByPriceRange(minPrice, maxPrice, limit = 12) {
  return await getBooks({ 
    price_min: minPrice,
    price_max: maxPrice,
    is_active: true, 
    limit 
  });
}

// Get books by publication year
export async function getBooksByYear(minYear, maxYear, limit = 12) {
  return await getBooks({ 
    publication_year_min: minYear,
    publication_year_max: maxYear,
    is_active: true, 
    limit 
  });
}

// Get books by cover type
export async function getBooksByCoverType(coverType, limit = 12) {
  return await getBooks({ 
    cover_type: coverType,
    is_active: true, 
    limit 
  });
}

// Get books by owner type
export async function getBooksByOwnerType(ownerType, limit = 12) {
  return await getBooks({ 
    owner_type: ownerType,
    is_active: true, 
    limit 
  });
}

// Get books by shop
export async function getBooksByShop(shopId, limit = 12) {
  return await getBooks({ 
    shop: shopId,
    is_active: true, 
    limit 
  });
}

// Get books by user
export async function getBooksByUser(userId, limit = 12) {
  return await getBooks({ 
    posted_by: userId,
    is_active: true, 
    limit 
  });
}
