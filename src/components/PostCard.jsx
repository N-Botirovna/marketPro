"use client";

import React from 'react';
import Link from 'next/link';

const PostCard = ({ post, onEdit, onDelete }) => {
  if (!post) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTags = (tags) => {
    if (!tags) return [];
    return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  return (
    <div className="post-card border border-gray-100 rounded-16 p-20 hover-border-main-600 transition-2 position-relative">
      {/* Action Buttons */}
      {(onEdit || onDelete) && (
        <div className="position-absolute top-0 end-0 p-12 d-flex gap-8">
          {onEdit && (
            <button 
              className="btn btn-sm btn-outline-main rounded-circle p-8"
              onClick={() => onEdit(post)}
              title="Tahrirlash"
            >
              <i className="ph ph-pencil text-xs"></i>
            </button>
          )}
          {onDelete && (
            <button 
              className="btn btn-sm btn-outline-danger rounded-circle p-8"
              onClick={() => onDelete(post)}
              title="O'chirish"
            >
              <i className="ph ph-trash text-xs"></i>
            </button>
          )}
        </div>
      )}

      {/* Post Header */}
      <div className="d-flex align-items-start gap-12 mb-16">
        <div className="flex-shrink-0">
          <img 
            src={post.posted_by?.picture || '/assets/images/thumbs/user-placeholder.png'} 
            alt={post.posted_by?.first_name || 'User'}
            className="rounded-circle"
            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '/assets/images/thumbs/user-placeholder.png';
            }}
          />
        </div>
        <div className="flex-grow-1">
          <h6 className="text-sm fw-semibold text-gray-900 mb-2">
            {post.posted_by?.first_name || 'Noma\'lum'} {post.posted_by?.last_name || ''}
          </h6>
          <p className="text-xs text-gray-500 mb-0">
            {formatDate(post.created_at)}
          </p>
        </div>
        {!post.is_public && (
          <span className="badge bg-gray-100 text-gray-600 px-8 py-4 rounded-pill text-xs">
            <i className="ph ph-lock me-4"></i>
            Shaxsiy
          </span>
        )}
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-16">
          <img 
            src={post.image} 
            alt={post.title}
            className="w-100 rounded-12"
            style={{ height: '200px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Post Content */}
      <div className="mb-16">
        <h5 className="text-lg fw-semibold text-gray-900 mb-8">
          {post.title}
        </h5>
        <p className="text-gray-600 text-sm mb-0" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {post.content}
        </p>
      </div>

      {/* Tags */}
      {post.tags && formatTags(post.tags).length > 0 && (
        <div className="mb-16">
          <div className="d-flex flex-wrap gap-4">
            {formatTags(post.tags).map((tag, index) => (
              <span key={index} className="badge bg-main-100 text-main-600 px-8 py-4 rounded-pill text-xs">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-16">
          <button className="btn btn-sm btn-outline-gray d-flex align-items-center gap-4">
            <i className="ph ph-heart text-gray-500"></i>
            <span className="text-xs text-gray-500">0</span>
          </button>
          <button className="btn btn-sm btn-outline-gray d-flex align-items-center gap-4">
            <i className="ph ph-chat-circle text-gray-500"></i>
            <span className="text-xs text-gray-500">0</span>
          </button>
          <button className="btn btn-sm btn-outline-gray d-flex align-items-center gap-4">
            <i className="ph ph-share text-gray-500"></i>
            <span className="text-xs text-gray-500">Ulashish</span>
          </button>
        </div>
        <Link href={`/post/${post.id}`} className="btn btn-sm btn-outline-main">
          Batafsil
        </Link>
      </div>
    </div>
  );
};

export default PostCard;
