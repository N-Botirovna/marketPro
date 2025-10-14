// API Response handling utilities

/**
 * Handle user profile API response from /me endpoint
 * @param {Object} response - API response object
 * @returns {Object} Normalized user data
 */
export function handleUserProfileResponse(response) {
  const { data } = response;
  
  return {
    id: data?.id || null,
    first_name: data?.first_name || '',
    last_name: data?.last_name || '',
    app_phone_number: data?.app_phone_number || null,
    bio: data?.bio || null,
    role: data?.role || 'simple',
    picture: data?.picture || null,
    region: data?.region || null,
    district: data?.district || null,
    point: data?.point || null,
    location_text: data?.location_text || null,
    user_type: data?.user_type || 'bookshop',
    raw: data,
  };
}

/**
 * Handle books list API response
 * @param {Object} response - API response object
 * @returns {Object} Normalized books data
 */
export function handleBooksListResponse(response) {
  const { data } = response;
  
  return {
    books: data?.books || data?.result || data?.results || [],
    count: data?.count || data?.total_count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    success: data?.success !== false,
    total_pages: data?.total_pages || null,
    current_page: data?.current_page || data?.page || 1,
    has_next: data?.has_next || false,
    has_previous: data?.has_previous || false,
    raw: data,
  };
}

/**
 * Handle single book API response
 * @param {Object} response - API response object
 * @returns {Object} Normalized book data
 */
export function handleBookResponse(response) {
  const { data } = response;
  
  return {
    book: data?.book || data?.result || data || null,
    success: data?.success !== false,
    message: data?.message || '',
    raw: data,
  };
}

/**
 * Handle pagination data
 * @param {Object} response - API response object
 * @returns {Object} Pagination info
 */
export function handlePaginationResponse(response) {
  const { data } = response;
  
  return {
    count: data?.count || 0,
    next: data?.next || null,
    previous: data?.previous || null,
    total_pages: data?.total_pages || null,
    current_page: data?.current_page || data?.page || 1,
    has_next: data?.has_next || false,
    has_previous: data?.has_previous || false,
  };
}
