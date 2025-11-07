"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from "next-intl";
import { createBook, updateBook, patchBook } from '@/services/books';
import { getBookCategories } from '@/services/categories';
import Spin from './Spin';
import { useToast } from './Toast';

const BookCreateModal = ({ isOpen, onClose, onSuccess, editBook = null }) => {
  const { showToast, ToastContainer } = useToast();
  const t = useTranslations("BookCreateModal");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [formData, setFormData] = useState({
    // Required fields
    type: 'seller', // gift, exchange, seller
    is_used: false,
    picture: null,
    name: '',
    author: '',
    description: '',
    language: 'uz',
    script_type: '',
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
        // Get localized values from editBook, fallback to default fields
        const getLocalizedValue = (fieldPrefix) => {
          return editBook[`${fieldPrefix}_${locale}`] || editBook[fieldPrefix] || '';
        };
        
        setFormData({
          type: editBook.type || 'seller',
          is_used: editBook.is_used || false,
          picture: null,
          name: getLocalizedValue('name'),
          author: getLocalizedValue('author'),
          description: getLocalizedValue('description'),
          language: editBook.language || 'uz',
          script_type: editBook.script_type || '',
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
          name: '',
          author: '',
          description: '',
          language: 'uz',
          script_type: '',
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
  }, [isOpen, editBook, locale]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.size, 'bytes', file.type);
      setFormData(prev => ({
        ...prev,
        picture: file
      }));
    } else {
      console.warn('No file selected');
      setFormData(prev => ({
        ...prev,
        picture: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.picture && !editBook) {
        alert(t("imageRequired"));
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      
      // Required fields
      submitData.append('type', formData.type);
      submitData.append('name', formData.name);
      submitData.append('author', formData.author);
      submitData.append('language', formData.language);
      submitData.append('cover_type', formData.cover_type);
      submitData.append('publication_year', formData.publication_year);
      submitData.append('pages', formData.pages);
      submitData.append('is_used', formData.is_used.toString());
      
      // Description - always send, even if empty (backend expects it)
      submitData.append('description', formData.description || '');
      
      // Optional fields - only add if they have values
      if (formData.script_type && formData.script_type.trim() !== '') {
        submitData.append('script_type', formData.script_type);
      }
      
      if (formData.price && formData.price !== '') {
        submitData.append('price', formData.price);
      }
      
      if (formData.discount_price && formData.discount_price !== '') {
        submitData.append('discount_price', formData.discount_price);
      }
      
      if (formData.isbn && formData.isbn.trim() !== '') {
        submitData.append('isbn', formData.isbn);
      }
      
      if (formData.category && formData.category !== '') {
        submitData.append('category', formData.category);
      }
      
      if (formData.sub_category && formData.sub_category !== '') {
        submitData.append('sub_category', formData.sub_category);
      }

      // Add picture file - required for new books
      if (formData.picture) {
        submitData.append('picture', formData.picture);
      } else if (editBook && editBook.picture) {
        // For edit mode, if no new picture is selected, we might need to handle this differently
        // But since API requires picture, we should still send it
        console.warn('No picture file selected for edit');
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, value.name, value.size, 'bytes');
        } else {
          console.log(`${key}:`, value);
        }
      }

      let response;
      if (editBook) {
        response = await patchBook(editBook.id, submitData);
      } else {
        response = await createBook(submitData);
      }

      if (response.success) {
        showToast({
          type: 'success',
          title: tCommon("success"),
          message: editBook ? t("bookUpdated") : t("bookCreated"),
          duration: 3000
        });
        onSuccess(response.book);
        onClose();
        // Reset form
        setFormData({
          type: 'seller',
          is_used: false,
          picture: null,
          name: '',
          author: '',
          description: '',
          language: 'uz',
          script_type: '',
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
        alert(response.message || t("error"));
      }
    } catch (error) {
      console.error('Error submitting book:', error);
      alert(t("error"));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get placeholder based on locale
  const getPlaceholder = (key) => {
    const localeKey = `${key}${locale.charAt(0).toUpperCase() + locale.slice(1)}Placeholder`;
    return t(localeKey) || t(`${key}Placeholder`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editBook ? t("editBook") : t("addBook")}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-4">
                {/* Book Type Selection */}
                <div className="col-12">
                  <label className="form-label fw-semibold">{t("bookType")}</label>
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
                      <label className="form-check-label">{t("sell")}</label>
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
                      <label className="form-check-label">{t("gift")}</label>
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
                      <label className="form-check-label">{t("exchange")}</label>
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
                    <label className="form-check-label">{t("usedBook")}</label>
                  </div>
                </div>

                {/* Book Name */}
                <div className="col-12">
                  <label className="form-label fw-semibold">{t("bookName")}</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={getPlaceholder("name")}
                    required
                  />
                </div>

                {/* Author */}
                <div className="col-12">
                  <label className="form-label fw-semibold">{t("author")}</label>
                  <input
                    type="text"
                    name="author"
                    className="form-control"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder={getPlaceholder("author")}
                    required
                  />
                </div>

                {/* Language and Cover Type */}
                <div className="col-md-6">
                  <label className="form-label">{t("language")}</label>
                  <select
                    name="language"
                    className="form-select"
                    value={formData.language}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="uz">{t("uzbekLang")}</option>
                    <option value="ru">{t("russianLang")}</option>
                    <option value="en">{t("englishLang")}</option>
                    <option value="ar">{t("arabicLang")}</option>
                    <option value="tr">{t("turkishLang")}</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">{t("coverType")}</label>
                  <select
                    name="cover_type"
                    className="form-select"
                    value={formData.cover_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="hard">{t("hard")}</option>
                    <option value="soft">{t("soft")}</option>
                  </select>
                </div>

                {/* Script Type */}
                <div className="col-md-6">
                  <label className="form-label">{t("scriptType")}</label>
                  <select
                    name="script_type"
                    className="form-select"
                    value={formData.script_type}
                    onChange={handleInputChange}
                  >
                    <option value="">{t("select")}</option>
                    <option value="latin">{t("latin")}</option>
                    <option value="cyrillic">{t("cyrillic")}</option>
                    <option value="arabic">{t("arabic")}</option>
                  </select>
                </div>

                {/* Price Fields */}
                <div className="col-md-6">
                  <label className="form-label">{t("price")}</label>
                  <input
                    type="text"
                    name="price"
                    className="form-control"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder={t("pricePlaceholder")}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">{t("discountPrice")}</label>
                  <input
                    type="text"
                    name="discount_price"
                    className="form-control"
                    value={formData.discount_price}
                    onChange={handleInputChange}
                    placeholder={t("discountPricePlaceholder")}
                  />
                </div>

                {/* Publication Year and Pages */}
                <div className="col-md-6">
                  <label className="form-label">{t("publicationYear")}</label>
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
                  <label className="form-label">{t("pages")}</label>
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
                  <label className="form-label">{t("isbn")}</label>
                  <input
                    type="text"
                    name="isbn"
                    className="form-control"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder={t("isbnPlaceholder")}
                  />
                </div>

                {/* Category and Subcategory */}
                <div className="col-md-6">
                  <label className="form-label">{t("category")}</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={categoriesLoading}
                  >
                    <option value="">{t("selectCategory")}</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">{t("subCategory")}</label>
                  <select
                    name="sub_category"
                    className="form-select"
                    value={formData.sub_category}
                    onChange={handleInputChange}
                    disabled={!formData.category || subCategories.length === 0}
                  >
                    <option value="">{t("selectSubCategory")}</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="col-12">
                  <label className="form-label fw-semibold">{t("description")}</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder={getPlaceholder("description")}
                  />
                  <div className="form-text">
                    {t("descriptionHelp")}
                  </div>
                </div>

                {/* Picture Upload */}
                <div className="col-12">
                  <label className="form-label fw-semibold">{t("image")}</label>
                  <input
                    type="file"
                    name="picture"
                    id="picture-input"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    required={!editBook}
                  />
                  {formData.picture && (
                    <div className="mt-2">
                      <p className="text-sm text-success">
                        {t("fileSelected")}: {formData.picture.name}
                      </p>
                    </div>
                  )}
                  {editBook?.picture && !formData.picture && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">{t("currentImage")}:</p>
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
                {t("cancel")}
              </button>
              <button type="submit" className="btn btn-main" disabled={loading}>
                {loading ? (
                  <>
                    <Spin size="sm" text={t("saving")} />
                    {t("saving")}
                  </>
                ) : (
                  editBook ? t("update") : t("add")
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
