"use client";

import React, { useState, useEffect } from 'react';
import { createBook, updateBook } from '@/services/books';
import { getBookCategories } from '@/services/categories';

const BookCreateModal = ({ isOpen, onClose, onSuccess, editBook = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    author: '',
    publication_year: '',
    cover_type: 'hard',
    condition: 'new',
    is_used: false,
    is_gift: false,
    is_exchange: false,
    picture: null,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editBook) {
        setFormData({
          name: editBook.name || '',
          description: editBook.description || '',
          price: editBook.price || '',
          category: editBook.category || '',
          subcategory: editBook.subcategory || '',
          author: editBook.author || '',
          publication_year: editBook.publication_year || '',
          cover_type: editBook.cover_type || 'hard',
          condition: editBook.condition || 'new',
          is_used: editBook.is_used || false,
          is_gift: editBook.is_gift || false,
          is_exchange: editBook.is_exchange || false,
          picture: null,
        });
      }
    }
  }, [isOpen, editBook]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await getBookCategories({ limit: 50 });
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        picture: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      let response;
      if (editBook) {
        response = await updateBook(editBook.id, submitData);
      } else {
        response = await createBook(submitData);
      }

      if (response.success) {
        onSuccess(response.book);
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          subcategory: '',
          author: '',
          publication_year: '',
          cover_type: 'hard',
          condition: 'new',
          is_used: false,
          is_gift: false,
          is_exchange: false,
          picture: null,
        });
      } else {
        alert(response.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error submitting book:', error);
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editBook ? 'Kitobni tahrirlash' : 'Yangi kitob qo\'shish'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Book Name */}
                <div className="col-12">
                  <label className="form-label">Kitob nomi *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label">Tavsif</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Price */}
                <div className="col-md-6">
                  <label className="form-label">Narx (so'm) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Author */}
                <div className="col-md-6">
                  <label className="form-label">Muallif</label>
                  <input
                    type="text"
                    name="author"
                    className="form-control"
                    value={formData.author}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Category */}
                <div className="col-md-6">
                  <label className="form-label">Kategoriya</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={categoriesLoading}
                  >
                    <option value="">Kategoriyani tanlang</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Publication Year */}
                <div className="col-md-6">
                  <label className="form-label">Nashr yili</label>
                  <input
                    type="number"
                    name="publication_year"
                    className="form-control"
                    value={formData.publication_year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                {/* Cover Type */}
                <div className="col-md-6">
                  <label className="form-label">Muqova turi</label>
                  <select
                    name="cover_type"
                    className="form-select"
                    value={formData.cover_type}
                    onChange={handleInputChange}
                  >
                    <option value="hard">Qattiq</option>
                    <option value="soft">Yumshoq</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="col-md-6">
                  <label className="form-label">Holat</label>
                  <select
                    name="condition"
                    className="form-select"
                    value={formData.condition}
                    onChange={handleInputChange}
                  >
                    <option value="new">Yangi</option>
                    <option value="good">Yaxshi</option>
                    <option value="fair">O'rtacha</option>
                    <option value="poor">Yomon</option>
                  </select>
                </div>

                {/* Book Type Checkboxes */}
                <div className="col-12">
                  <label className="form-label">Kitob turi</label>
                  <div className="d-flex gap-4 flex-wrap">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="is_used"
                        className="form-check-input"
                        checked={formData.is_used}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Ishlatilgan</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="is_gift"
                        className="form-check-input"
                        checked={formData.is_gift}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Sovg'a</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="is_exchange"
                        className="form-check-input"
                        checked={formData.is_exchange}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Almashtirish</label>
                    </div>
                  </div>
                </div>

                {/* Picture Upload */}
                <div className="col-12">
                  <label className="form-label">Rasm</label>
                  <input
                    type="file"
                    name="picture"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {editBook?.picture && !formData.picture && (
                    <div className="mt-2">
                      <img 
                        src={editBook.picture} 
                        alt="Current" 
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Bekor qilish
              </button>
              <button type="submit" className="btn btn-main" disabled={loading}>
                {loading ? 'Saqlanmoqda...' : (editBook ? 'Yangilash' : 'Qo\'shish')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookCreateModal;
