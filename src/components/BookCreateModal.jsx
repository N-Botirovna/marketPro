"use client";

import React, { useState, useEffect } from 'react';
import { createBook, updateBook, patchBook } from '@/services/books';
import { getBookCategories } from '@/services/categories';
import Spin from './Spin';
import { useToast } from './Toast';

const BookCreateModal = ({ isOpen, onClose, onSuccess, editBook = null }) => {
  const { showToast, ToastContainer } = useToast();
  const [activeLanguage, setActiveLanguage] = useState('uz');
  const [formData, setFormData] = useState({
    // Required fields
    type: 'seller', // gift, exchange, seller
    is_used: false,
    picture: null,
    name_uz: '',
    name_ru: '',
    name_en: '',
    language: 'uz',
    description: '',
    script_type: '',
    author: '',
    cover_type: 'hard', // hard, soft
    price: '',
    discount_price: '',
    publication_year: '',
    pages: '',
    isbn: '',
    
    // Optional fields
    category: '',
    sub_category: '',
  });
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (editBook) {
        setFormData({
          type: editBook.type || 'seller',
          is_used: editBook.is_used || false,
          picture: null,
          name_uz: editBook.name_uz || editBook.name || '',
          name_ru: editBook.name_ru || '',
          name_en: editBook.name_en || '',
          language: editBook.language || 'uz',
          description: editBook.description || '',
          script_type: editBook.script_type || '',
          author: editBook.author || '',
          cover_type: editBook.cover_type || 'hard',
          price: editBook.price || '',
          discount_price: editBook.discount_price || '',
          publication_year: editBook.publication_year || '',
          pages: editBook.pages || '',
          isbn: editBook.isbn || '',
          category: editBook.category || '',
          sub_category: editBook.sub_category || '',
        });
      } else {
        // Reset form for new book
        setFormData({
          type: 'seller',
          is_used: false,
          picture: null,
          name_uz: '',
          name_ru: '',
          name_en: '',
          language: 'uz',
          description: '',
          script_type: '',
          author: '',
          cover_type: 'hard',
          price: '',
          discount_price: '',
          publication_year: '',
          pages: '',
          isbn: '',
          category: '',
          sub_category: '',
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

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      // You'll need to implement getBookSubCategories in your categories service
      // const response = await getBookSubCategories(categoryId);
      // setSubCategories(response.subcategories || []);
      setSubCategories([]); // Placeholder for now
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Fetch subcategories when category changes
    if (name === 'category') {
      fetchSubCategories(value);
    }
  };

  const handleLanguageChange = (lang) => {
    setActiveLanguage(lang);
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
      
      // Add the active language name as the main name
      const mainName = formData[`name_${activeLanguage}`] || formData.name_uz;
      submitData.append('name', mainName);
      
      // Add all form fields to FormData (excluding null/empty values)
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '' && key !== 'picture') {
          // Convert boolean to string for FormData
          const value = typeof formData[key] === 'boolean' ? formData[key].toString() : formData[key];
          submitData.append(key, value);
        }
      });

      // Add picture file if exists
      if (formData.picture) {
        submitData.append('picture', formData.picture);
      }

      console.log('📤 FormData being sent:');
      for (let [key, value] of submitData.entries()) {
        console.log(`${key}:`, value);
      }
      
      console.log('🔍 FormData type check:', submitData instanceof FormData);
      console.log('🔍 Content-Type will be set by browser for FormData');

      let response;
      if (editBook) {
        // Use PATCH for updates as requested
        response = await patchBook(editBook.id, submitData);
      } else {
        response = await createBook(submitData);
      }

      if (response.success) {
        showToast({
          type: 'success',
          title: 'Muvaffaqiyatli!',
          message: editBook ? 'Kitob muvaffaqiyatli yangilandi' : 'Kitob muvaffaqiyatli yaratildi',
          duration: 3000
        });
        onSuccess(response.book);
        onClose();
        // Reset form
        setFormData({
          type: 'seller',
          is_used: false,
          picture: null,
          name_uz: '',
          name_ru: '',
          name_en: '',
          language: 'uz',
          description: '',
          script_type: '',
          author: '',
          cover_type: 'hard',
          price: '',
          discount_price: '',
          publication_year: '',
          pages: '',
          isbn: '',
          category: '',
          sub_category: '',
        });
      } else {
        alert(response.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error submitting book:', error);
      console.error('Error details:', error.response?.data);
      alert('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editBook ? 'Kitobni tahrirlash' : 'Yangi kitob qo\'shish'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-4">
                {/* Book Type Selection */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Kitob turi *</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        type="radio"
                        name="type"
                        value="seller"
                        className="form-check-input"
                        checked={formData.type === 'seller'}
                        onChange={handleInputChange}
                        required
                      />
                      <label className="form-check-label">Sotish</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        name="type"
                        value="gift"
                        className="form-check-input"
                        checked={formData.type === 'gift'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Sovg'a</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        name="type"
                        value="exchange"
                        className="form-check-input"
                        checked={formData.type === 'exchange'}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">Almashtirish</label>
                    </div>
                  </div>
                </div>

                {/* Used/New Status */}
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="is_used"
                      className="form-check-input"
                      checked={formData.is_used}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Ishlatilgan kitob</label>
                  </div>
                </div>

                {/* Language Tabs for Book Names */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Kitob nomi *</label>
                  <div className="border rounded p-3">
                    {/* Language Tabs */}
                    <ul className="nav nav-tabs nav-tabs-sm mb-3" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeLanguage === 'uz' ? 'active' : ''}`}
                          onClick={() => handleLanguageChange('uz')}
                          type="button"
                        >
                          O'zbek
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeLanguage === 'ru' ? 'active' : ''}`}
                          onClick={() => handleLanguageChange('ru')}
                          type="button"
                        >
                          Русский
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button
                          className={`nav-link ${activeLanguage === 'en' ? 'active' : ''}`}
                          onClick={() => handleLanguageChange('en')}
                          type="button"
                        >
                          English
                        </button>
                      </li>
                    </ul>

                    {/* Language Inputs */}
                    <div className="tab-content">
                      <div className={`tab-pane ${activeLanguage === 'uz' ? 'show active' : ''}`}>
                        <input
                          type="text"
                          name="name_uz"
                          className="form-control"
                          value={formData.name_uz}
                          onChange={handleInputChange}
                          placeholder="Kitob nomini o'zbek tilida kiriting"
                          required={activeLanguage === 'uz'}
                        />
                      </div>
                      <div className={`tab-pane ${activeLanguage === 'ru' ? 'show active' : ''}`}>
                        <input
                          type="text"
                          name="name_ru"
                          className="form-control"
                          value={formData.name_ru}
                          onChange={handleInputChange}
                          placeholder="Введите название книги на русском языке"
                          required={activeLanguage === 'ru'}
                        />
                      </div>
                      <div className={`tab-pane ${activeLanguage === 'en' ? 'show active' : ''}`}>
                        <input
                          type="text"
                          name="name_en"
                          className="form-control"
                          value={formData.name_en}
                          onChange={handleInputChange}
                          placeholder="Enter book title in English"
                          required={activeLanguage === 'en'}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Author and Language */}
                <div className="col-md-6">
                  <label className="form-label">Muallif *</label>
                  <input
                    type="text"
                    name="author"
                    className="form-control"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Til *</label>
                  <select
                    name="language"
                    className="form-select"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="uz">O'zbek</option>
                    <option value="ru">Rus</option>
                    <option value="en">Ingliz</option>
                    <option value="ar">Arab</option>
                    <option value="tr">Turk</option>
                  </select>
                </div>

                {/* Cover Type and Script Type */}
                <div className="col-md-6">
                  <label className="form-label">Muqova turi *</label>
                  <select
                    name="cover_type"
                    className="form-select"
                    value={formData.cover_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="hard">Qattiq</option>
                    <option value="soft">Yumshoq</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Yozuv turi</label>
                  <select
                    name="script_type"
                    className="form-select"
                    value={formData.script_type}
                    onChange={handleInputChange}
                  >
                    <option value="">Tanlang</option>
                    <option value="latin">Lotin</option>
                    <option value="cyrillic">Kirill</option>
                    <option value="arabic">Arab</option>
                  </select>
                </div>

                {/* Price Fields */}
                <div className="col-md-6">
                  <label className="form-label">Narx (so'm)</label>
                  <input
                    type="text"
                    name="price"
                    className="form-control"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Masalan: 50000"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Chegirma narxi (so'm)</label>
                  <input
                    type="text"
                    name="discount_price"
                    className="form-control"
                    value={formData.discount_price}
                    onChange={handleInputChange}
                    placeholder="Masalan: 40000"
                  />
                </div>

                {/* Publication Year and Pages */}
                <div className="col-md-6">
                  <label className="form-label">Nashr yili *</label>
                  <input
                    type="number"
                    name="publication_year"
                    className="form-control"
                    value={formData.publication_year}
                    onChange={handleInputChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Sahifalar soni *</label>
                  <input
                    type="number"
                    name="pages"
                    className="form-control"
                    value={formData.pages}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                {/* ISBN */}
                <div className="col-12">
                  <label className="form-label">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    className="form-control"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="Masalan: 978-0-123456-78-9"
                  />
                </div>

                {/* Category and Subcategory */}
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

                <div className="col-md-6">
                  <label className="form-label">Pastki kategoriya</label>
                  <select
                    name="sub_category"
                    className="form-select"
                    value={formData.sub_category}
                    onChange={handleInputChange}
                    disabled={!formData.category || subCategories.length === 0}
                  >
                    <option value="">Pastki kategoriyani tanlang</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description with Rich Text */}
                <div className="col-12">
                  <label className="form-label">Tavsif</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="6"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Kitob haqida batafsil ma'lumot kiriting..."
                  />
                  <div className="form-text">
                    Bold, italic, rasmlar va boshqa formatlarni qo'llab-quvvatlaydi
                  </div>
                </div>

                {/* Picture Upload */}
                <div className="col-12">
                  <label className="form-label">Rasm *</label>
                  <input
                    type="file"
                    name="picture"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editBook}
                  />
                  {editBook?.picture && !formData.picture && (
                    <div className="mt-2">
                      <img 
                        src={editBook.picture} 
                        alt="Current" 
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                        className="rounded border"
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
                {loading ? (
                  <>
                    <Spin size="sm" text="Saqlanmoqda..." />
                    Saqlanmoqda...
                  </>
                ) : (
                  editBook ? 'Yangilash' : 'Qo\'shish'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default BookCreateModal;
