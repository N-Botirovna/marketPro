"use client";

import React, { useState } from 'react';
import { createPost, updatePost } from '@/services/posts';

const PostCreateModal = ({ isOpen, onClose, onSuccess, editPost = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
    tags: '',
    is_public: true,
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      if (editPost) {
        setFormData({
          title: editPost.title || '',
          content: editPost.content || '',
          image: null,
          tags: editPost.tags || '',
          is_public: editPost.is_public !== false,
        });
      } else {
        setFormData({
          title: '',
          content: '',
          image: null,
          tags: '',
          is_public: true,
        });
      }
    }
  }, [isOpen, editPost]);

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
        image: file
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
      if (editPost) {
        response = await updatePost(editPost.id, submitData);
      } else {
        response = await createPost(submitData);
      }

      if (response.success) {
        onSuccess(response.post);
        onClose();
        // Reset form
        setFormData({
          title: '',
          content: '',
          image: null,
          tags: '',
          is_public: true,
        });
      } else {
        alert(response.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
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
              {editPost ? 'Postni tahrirlash' : 'Yangi post qo\'shish'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Post Title */}
                <div className="col-12">
                  <label className="form-label">Post sarlavhasi *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Post sarlavhasini kiriting..."
                  />
                </div>

                {/* Post Content */}
                <div className="col-12">
                  <label className="form-label">Post matni *</label>
                  <textarea
                    name="content"
                    className="form-control"
                    rows="6"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    placeholder="Post matnini kiriting..."
                  />
                </div>

                {/* Tags */}
                <div className="col-12">
                  <label className="form-label">Teglar</label>
                  <input
                    type="text"
                    name="tags"
                    className="form-control"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="Teglarni vergul bilan ajrating (masalan: kitob, o'qish, adabiyot)"
                  />
                  <div className="form-text">
                    Teglarni vergul bilan ajrating
                  </div>
                </div>

                {/* Image Upload */}
                <div className="col-12">
                  <label className="form-label">Rasm</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {editPost?.image && !formData.image && (
                    <div className="mt-2">
                      <img 
                        src={editPost.image} 
                        alt="Current" 
                        style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Public/Private */}
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="is_public"
                      className="form-check-input"
                      checked={formData.is_public}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">
                      Ommaviy post (barcha foydalanuvchilar ko'ra oladi)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Bekor qilish
              </button>
              <button type="submit" className="btn btn-main" disabled={loading}>
                {loading ? 'Saqlanmoqda...' : (editPost ? 'Yangilash' : 'Qo\'shish')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostCreateModal;
