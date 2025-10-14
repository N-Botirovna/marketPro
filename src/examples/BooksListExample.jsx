// Example component showing how to display books list
import React, { useState, useEffect } from 'react';
import { handleBooksListResponse } from '@/utils/apiResponse';

const BooksListExample = () => {
  const [booksData, setBooksData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with your actual books data
    const simulateApiCall = async () => {
      setLoading(true);
      
      // This is the actual response from your books list endpoint
      const booksResponse = {
        data: {
          "result": [
            {
              "id": 4,
              "type": "exchange",
              "is_used": false,
              "name": "Shaytanat 1, 2, 3, 4",
              "author": "Tohir Malik",
              "price": null,
              "discount_price": null,
              "picture": "http://api.kitobzor.uz/media/books/pictures/Screenshot_from_2025-07-20_11-13-00.jpeg",
              "posted_by": {
                "id": 9,
                "picture": "http://api.kitobzor.uz/media/users/pictures/default_user.png",
                "first_name": "Nargiza",
                "last_name": ""
              },
              "shop": null,
              "owner_type": "user",
              "percentage": null,
              "like_count": 0,
              "view_count": 2,
              "created_at": "2025-07-20T11:13:19.694170"
            }
          ],
          "success": true
        }
      };

      // Process the response using our utility function
      const processedBooksData = handleBooksListResponse(booksResponse);
      setBooksData(processedBooksData);
      
      setLoading(false);
    };

    simulateApiCall();
  }, []);

  if (loading) {
    return (
      <div className="container py-32">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-gray-600 mt-16">Loading books...</p>
        </div>
      </div>
    );
  }

  if (!booksData || !booksData.books.length) {
    return (
      <div className="container py-32">
        <div className="text-center">
          <i className="ph ph-book text-gray-400" style={{ fontSize: '48px' }}></i>
          <p className="text-gray-600 mt-16">No books found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-32">
      <div className="row g-3">
        <div className="col-12">
          <h2 className="text-gray-900 fw-bold mb-24">Books List</h2>
          <p className="text-gray-600 mb-24">
            Found {booksData.count} books
          </p>
        </div>
        
        {booksData.books.map((book) => (
          <div key={book.id} className="col-md-6 col-lg-4">
            <div className="card border border-gray-200 rounded-8 h-100">
              <div className="card-img-top position-relative">
                <img 
                  src={book.picture} 
                  alt={book.name}
                  className="w-100"
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = '/assets/images/icon/default-book.png';
                  }}
                />
                <div className="position-absolute top-0 end-0 m-12">
                  <span className={`badge ${book.type === 'exchange' ? 'bg-warning' : 'bg-success'}`}>
                    {book.type}
                  </span>
                </div>
              </div>
              <div className="card-body p-16">
                <h6 className="card-title text-gray-900 fw-semibold mb-8">
                  {book.name}
                </h6>
                <p className="card-text text-gray-600 text-sm mb-8">
                  by {book.author}
                </p>
                
                {/* Posted by info */}
                <div className="d-flex align-items-center mb-12">
                  <img 
                    src={book.posted_by.picture} 
                    alt={book.posted_by.first_name}
                    className="rounded-circle me-8"
                    style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                  />
                  <span className="text-gray-600 text-xs">
                    Posted by {book.posted_by.first_name} {book.posted_by.last_name}
                  </span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    {book.price ? (
                      <span className="text-primary fw-semibold">
                        ${book.price}
                      </span>
                    ) : (
                      <span className="text-success fw-semibold">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs">
                    <i className="ph ph-eye me-1"></i>
                    {book.view_count}
                  </div>
                </div>
                
                <div className="mt-8">
                  <small className="text-gray-500">
                    Created: {new Date(book.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksListExample;
