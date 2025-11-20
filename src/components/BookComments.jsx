"use client";
import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getBookComments, createBookComment, likeComment, deleteComment } from "@/services/books";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "./Toast";
import Spin from "./Spin";

const BookComments = ({ bookId }) => {
  const tCommon = useTranslations("Common");
  const tBook = useTranslations("BookDetails");
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const locale = useLocale();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from JWT token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // JWT token'ni decode qilamiz (base64)
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            
            const decoded = JSON.parse(jsonPayload);
            console.log('🔓 Decoded JWT:', decoded);
            
            // JWT'dan user_id yoki id'ni olamiz
            const userId = decoded.user_id || decoded.id || decoded.sub;
            
            if (userId) {
              console.log('✨ Found user ID from JWT:', userId);
              setCurrentUserId(userId);
            } else {
              console.log('❌ User ID not found in JWT');
            }
          } catch (e) {
            console.error('JWT decode error:', e);
          }
        } else {
          console.log('❌ No auth_token in localStorage');
        }
      } catch (error) {
        console.error('Error getting user:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (bookId) {
      fetchComments();
    }
  }, [bookId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await getBookComments(bookId);
      setComments(response.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      showToast({
        type: "error",
        title: tCommon("error"),
        message: "Izohlarni yuklashda xatolik yuz berdi",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast({
        type: "info",
        title: tCommon("info") || "Ma'lumot",
        message: "Izoh qoldirish uchun tizimga kiring",
        duration: 3000,
      });
      return;
    }

    if (!commentText.trim()) {
      showToast({
        type: "warning",
        title: tCommon("warning") || "Ogohlantirish",
        message: "Izohingizni kiriting",
        duration: 3000,
      });
      return;
    }

    const tempCommentText = commentText.trim();
    setCommentText("");

    try {
      setSubmitting(true);
      const response = await createBookComment(bookId, tempCommentText);
      
      if (response.success) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: "Izoh muvaffaqiyatli qo'shildi",
          duration: 3000,
        });
        
        // Yangi commentni darhol qo'shamiz (loading state'siz)
        const newComment = response.comment;
        if (newComment) {
          // Yangi comment'ni replies array bilan qo'shamiz
          const commentWithReplies = {
            ...newComment,
            replies: newComment.replies || []
          };
          setComments((prevComments) => [commentWithReplies, ...prevComments]);
        }
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      setCommentText(tempCommentText); // Xatolik bo'lsa, matnni qaytarib qo'yamiz
      showToast({
        type: "error",
        title: tCommon("error"),
        message: "Izoh qo'shishda xatolik yuz berdi",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast({
        type: "info",
        title: tCommon("info") || "Ma'lumot",
        message: "Javob yozish uchun tizimga kiring",
        duration: 3000,
      });
      return;
    }

    if (!replyText.trim()) {
      showToast({
        type: "warning",
        title: tCommon("warning") || "Ogohlantirish",
        message: "Javobingizni kiriting",
        duration: 3000,
      });
      return;
    }

    const tempReplyText = replyText.trim();
    setReplyText("");
    setReplyingTo(null);

    try {
      setSubmitting(true);
      const response = await createBookComment(bookId, tempReplyText, parentId);
      
      if (response.success) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: "Javob muvaffaqiyatli qo'shildi",
          duration: 3000,
        });
        
        // Reply qo'shilgan comment'ni avtomatik ochib qo'yamiz
        setExpandedComments((prev) => {
          const newSet = new Set(prev);
          newSet.add(parentId);
          return newSet;
        });
        
        // Yangi reply'ni parent comment'ning replies array'iga qo'shamiz
        const newReply = response.comment;
        if (newReply) {
          setComments((prevComments) => 
            prevComments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newReply]
                };
              }
              return comment;
            })
          );
        }
      }
    } catch (error) {
      console.error("Error creating reply:", error);
      setReplyText(tempReplyText); // Xatolik bo'lsa, matnni qaytarib qo'yamiz
      setReplyingTo(parentId); // Reply formani qayta ochamiz
      showToast({
        type: "error",
        title: tCommon("error"),
        message: "Javob yozishda xatolik yuz berdi",
        duration: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId, isReply = false, parentId = null) => {
    if (!isAuthenticated) {
      showToast({
        type: "info",
        title: tCommon("info") || "Ma'lumot",
        message: "Like qilish uchun tizimga kiring",
        duration: 3000,
      });
      return;
    }

    try {
      // Optimistic update - darhol UI'ni yangilaymiz
      if (isReply && parentId) {
        // Reply'ni like qilish
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (reply.id === commentId) {
                    const currentlyLiked = reply.is_liked || false;
                    const currentCount = reply.like_count || 0;
                    return {
                      ...reply,
                      is_liked: !currentlyLiked,
                      like_count: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1
                    };
                  }
                  return reply;
                })
              };
            }
            return comment;
          })
        );
      } else {
        // Parent comment'ni like qilish
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              const currentlyLiked = comment.is_liked || false;
              const currentCount = comment.like_count || 0;
              return {
                ...comment,
                is_liked: !currentlyLiked,
                like_count: currentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1
              };
            }
            return comment;
          })
        );
      }

      // API ga so'rov yuboramiz
      const response = await likeComment(commentId);
      
      if (response.success) {
        // API dan kelgan real ma'lumotni yangilaymiz
        if (isReply && parentId) {
          setComments((prevComments) =>
            prevComments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) => {
                    if (reply.id === commentId) {
                      return {
                        ...reply,
                        is_liked: response.is_liked
                      };
                    }
                    return reply;
                  })
                };
              }
              return comment;
            })
          );
        } else {
          setComments((prevComments) =>
            prevComments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  is_liked: response.is_liked
                };
              }
              return comment;
            })
          );
        }
      }
    } catch (error) {
      console.error("Error liking comment:", error);
      // Xatolik bo'lsa, eski holatga qaytaramiz
      if (isReply && parentId) {
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (reply.id === commentId) {
                    const currentlyLiked = reply.is_liked || false;
                    const currentCount = reply.like_count || 0;
                    return {
                      ...reply,
                      is_liked: !currentlyLiked,
                      like_count: currentlyLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
                    };
                  }
                  return reply;
                })
              };
            }
            return comment;
          })
        );
      } else {
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              const currentlyLiked = comment.is_liked || false;
              const currentCount = comment.like_count || 0;
              return {
                ...comment,
                is_liked: !currentlyLiked,
                like_count: currentlyLiked ? currentCount + 1 : Math.max(0, currentCount - 1)
              };
            }
            return comment;
          })
        );
      }
      showToast({
        type: "error",
        title: tCommon("error"),
        message: "Like qilishda xatolik yuz berdi",
        duration: 3000,
      });
    }
  };

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!isAuthenticated) {
      showToast({
        type: "info",
        title: tCommon("info") || "Ma'lumot",
        message: "Comment o'chirish uchun tizimga kiring",
        duration: 3000,
      });
      return;
    }

    // Tasdiqlash
    if (!window.confirm("Izohni o'chirishni xohlaysizmi?")) {
      return;
    }

    // Optimistic update - darhol UI'dan o'chiramiz
    let deletedComment = null;
    
    if (isReply && parentId) {
      // Reply'ni o'chirish
      setComments((prevComments) =>
        prevComments.map((comment) => {
          if (comment.id === parentId) {
            const replyToDelete = comment.replies.find(r => r.id === commentId);
            if (replyToDelete) {
              deletedComment = { ...replyToDelete, parentId };
            }
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply.id !== commentId)
            };
          }
          return comment;
        })
      );
    } else {
      // Parent comment'ni o'chirish
      setComments((prevComments) => {
        const commentToDelete = prevComments.find(c => c.id === commentId);
        if (commentToDelete) {
          deletedComment = { ...commentToDelete };
        }
        return prevComments.filter((comment) => comment.id !== commentId);
      });
    }

    try {
      const response = await deleteComment(commentId);
      
      if (response.success) {
        showToast({
          type: "success",
          title: tCommon("success"),
          message: "Izoh muvaffaqiyatli o'chirildi",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      
      // Xatolik bo'lsa, comment'ni qaytarib qo'yamiz
      if (deletedComment) {
        if (isReply && parentId) {
          setComments((prevComments) =>
            prevComments.map((comment) => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...comment.replies, deletedComment]
                };
              }
              return comment;
            })
          );
        } else {
          setComments((prevComments) => [deletedComment, ...prevComments]);
        }
      }
      
      showToast({
        type: "error",
        title: tCommon("error"),
        message: "Izoh o'chirishda xatolik yuz berdi",
        duration: 3000,
      });
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const organizeComments = (allComments) => {
    // API allaqachon nested structure qaytaradi
    // Faqat parent === null bo'lgan comment'larni qaytaramiz
    return allComments.filter(comment => !comment.parent);
  };

  const renderComment = (comment, isReply = false, parentId = null) => {
    const userName = comment.user?.first_name || comment.user?.username || "Foydalanuvchi";
    const userPicture = comment.user?.picture;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments.has(comment.id);
    const isOwner = currentUserId && comment.user?.id === currentUserId;

    return (
      <div key={comment.id} className={`comment-item ${isReply ? "ms-40" : "mb-24"}`}>
        <div className="d-flex gap-16">
          <div className="flex-shrink-0">
            {userPicture ? (
              <img
                src={userPicture}
                alt={userName}
                className="rounded-circle"
                style={{ width: isReply ? "32px" : "48px", height: isReply ? "32px" : "48px", objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle bg-main-50 text-main-600 d-flex align-items-center justify-content-center"
                style={{ width: isReply ? "32px" : "48px", height: isReply ? "32px" : "48px" }}
              >
                <i className={`ph ph-user ${isReply ? "text-lg" : "text-2xl"}`}></i>
              </div>
            )}
          </div>
          <div className="flex-grow-1">
            <div className="bg-gray-50 rounded-12 p-16">
              <div className="d-flex justify-content-between align-items-start mb-8">
                <h6 className={`mb-0 fw-semibold ${isReply ? "text-sm" : ""}`}>{userName}</h6>
                <small className="text-gray-500" style={{ fontSize: isReply ? "11px" : "12px" }}>
                  {formatDate(comment.created_at)}
                </small>
              </div>
              <p className={`text-gray-700 mb-0 ${isReply ? "text-sm" : ""}`}>{comment.comment}</p>
            </div>
            
            {/* Action buttons */}
            <div className="mt-12" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Like button */}
              <button
                type="button"
                onClick={() => handleLikeComment(comment.id, isReply, parentId)}
                style={{ 
                  background: "none",
                  border: "none",
                  padding: "4px 8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: comment.is_liked ? "#dc3545" : "#6c757d",
                  transition: "color 0.2s"
                }}
              >
                <i 
                  className={`ph ${comment.is_liked ? "ph-fill ph-heart" : "ph-heart"}`}
                  style={{ fontSize: "16px" }}
                ></i>
                {comment.like_count > 0 && <span>{comment.like_count}</span>}
              </button>

              {!isReply && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (replyingTo === comment.id) {
                        setReplyingTo(null);
                        setReplyText("");
                      } else {
                        setReplyingTo(comment.id);
                        setReplyText("");
                      }
                    }}
                    style={{ 
                      background: "none",
                      border: "none",
                      padding: "4px 8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "13px",
                      fontWeight: "500",
                      color: "#6c757d",
                      transition: "color 0.2s"
                    }}
                  >
                    <i className="ph ph-arrow-bend-up-left" style={{ fontSize: "16px" }}></i>
                    Javob yozish
                  </button>

                  {/* See replies / Hide replies button */}
                  {hasReplies && (
                    <button
                      type="button"
                      onClick={() => toggleReplies(comment.id)}
                      style={{ 
                        background: "none",
                        border: "none",
                        padding: "4px 8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0d6efd",
                        transition: "color 0.2s"
                      }}
                    >
                      <i 
                        className={`ph ${isExpanded ? "ph-caret-up" : "ph-caret-down"}`}
                        style={{ fontSize: "16px" }}
                      ></i>
                      {isExpanded ? "Javoblarni yashirish" : `Javoblarni ko'rish (${comment.replies.length})`}
                    </button>
                  )}
                </>
              )}

              {/* Delete button - Only show for own comments */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
                  style={{ 
                    background: "none",
                    border: "none",
                    padding: "4px 8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#dc3545",
                    marginLeft: "auto",
                    transition: "color 0.2s"
                  }}
                  title="O'chirish"
                >
                  <i className="ph ph-trash" style={{ fontSize: "16px" }}></i>
                  O'chirish
                </button>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-16">
                <div className="d-flex gap-12">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Javobingizni yozing..."
                    className="form-control rounded-pill"
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="btn btn-main rounded-pill px-24"
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      "Yuborish"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                    className="btn btn-outline-secondary rounded-pill px-24"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            )}

            {/* Render replies - only when expanded */}
            {!isReply && hasReplies && isExpanded && (
              <div className="replies mt-16">
                {comment.replies.map((reply) => renderComment(reply, true, comment.id))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-40">
        <Spin text="Izohlar yuklanmoqda..." />
      </div>
    );
  }

  const organizedComments = organizeComments(comments);

  return (
    <div className="book-comments">
      {/* Comment Form */}
      <div className="mb-40">
        <h6 className="mb-24">Izoh qoldirish</h6>
        <form onSubmit={handleSubmitComment}>
          <div className="d-flex gap-12">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Izohingizni yozing..."
              className="form-control rounded-pill"
              disabled={submitting}
            />
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="btn btn-main rounded-pill px-32"
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <>
                  <i className="ph ph-paper-plane-right me-8"></i>
                  Yuborish
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        <h6 className="mb-24">
          Izohlar ({comments.length})
        </h6>
        
        {organizedComments.length === 0 ? (
          <div className="text-center py-40">
            <i className="ph ph-chat-circle-dots text-6xl text-gray-300 mb-16"></i>
            <p className="text-gray-500">Hozircha izoh yo'q. Birinchi bo'lib izoh qoldiring!</p>
          </div>
        ) : (
          <div className="comments-wrapper">
            {organizedComments.map((comment) => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookComments;

