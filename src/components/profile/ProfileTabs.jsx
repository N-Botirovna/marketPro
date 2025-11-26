"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Spin from "@/components/Spin";
import BookCard from "@/components/BookCard";

const ProfileTabs = ({
  activeTab,
  onTabChange,
  userData,
  userBooks,
  archivedBooks,
  booksLoading,
  onCreateBook,
  onEditBook,
}) => {
  const tProfile = useTranslations("ProfileDashboard");

  const renderEmptyState = (iconClass, title, subtitle) => (
    <div className='text-center py-60'>
      <i className={`${iconClass} text-gray-300 text-5xl mb-16`}></i>
      <h5 className='text-gray-500 mb-0'>{title}</h5>
      <p className='text-gray-400 text-sm mt-8'>{subtitle}</p>
    </div>
  );

  const renderBooksTab = () => (
    <div className='p-32'>
      <div className='d-flex align-items-center justify-content-between mb-24'>
        <div className='d-flex align-items-center gap-16'>
          <h3 className='text-2xl fw-bold text-gray-900 mb-0'>{tProfile("myBooks")}</h3>
          <span className='badge bg-main-100 text-main-600 px-12 py-4 rounded-pill text-xs'>{tProfile("activeBadge")}</span>
        </div>
        <button
          className='btn btn-main py-8 px-16 text-sm'
          onClick={onCreateBook}
        >
          <i className='ph ph-plus me-8'></i>
          {tProfile("addBook")}
        </button>
      </div>
      {booksLoading ? (
        <div className='text-center py-60'>
          <Spin text={tProfile("booksLoading")} />
        </div>
      ) : userBooks.length > 0 ? (
        <div className='row g-4'>
          {userBooks.map((book) => (
            <div key={book.id} className='col-lg-4 col-md-6'>
              <BookCard
                book={book}
                onEdit={onEditBook}
                currentUserId={userData?.id}
                showEditForOwn={true}
              />
            </div>
          ))}
        </div>
      ) : (
        renderEmptyState('ph ph-books', tProfile("noBooksTitle"), tProfile("noBooksSubtitle"))
      )}
    </div>
  );

  const renderArchiveTab = () => (
    <div className='p-32'>
      <div className='d-flex align-items-center gap-16 mb-24'>
        <h3 className='text-2xl fw-bold text-gray-900 mb-0'>{tProfile("archiveTitle")}</h3>
        <span className='badge bg-gray-100 text-gray-600 px-12 py-4 rounded-pill text-xs'>{tProfile("archiveBadge")}</span>
      </div>
      {booksLoading ? (
        <div className='text-center py-60'>
          <Spin text={tProfile("booksLoading")} />
        </div>
      ) : archivedBooks.length > 0 ? (
        <div className='row g-4'>
          {archivedBooks.map((book) => (
            <div key={book.id} className='col-lg-4 col-md-6'>
              <BookCard
                book={book}
                onEdit={onEditBook}
                currentUserId={userData?.id}
                showEditForOwn={true}
              />
            </div>
          ))}
        </div>
      ) : (
        renderEmptyState('ph ph-archive', tProfile("noArchiveTitle"), tProfile("noArchiveSubtitle"))
      )}
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === 'archive') return renderArchiveTab();
    return renderBooksTab();
  };

  return (
    <div className='bg-white rounded-16 shadow-sm border border-gray-100 overflow-hidden'>
      <div className='border-bottom border-gray-100'>
        <nav className='nav nav-tabs nav-tabs-custom'>
          <button
            className={`nav-link ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => onTabChange('books')}
          >
            <i className='ph ph-books me-8'></i>
            {tProfile("booksTab")}
          </button>
          <button
            className={`nav-link ${activeTab === 'archive' ? 'active' : ''}`}
            onClick={() => onTabChange('archive')}
          >
            <i className='ph ph-archive me-8'></i>
            {tProfile("archiveTab")}
          </button>
        </nav>
      </div>
      <div>
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default ProfileTabs;

