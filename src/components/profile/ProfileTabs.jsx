"use client";

import React from "react";
import { useTranslations } from "next-intl";
import BookCard from "@/components/BookCard";
import BookGrid from "@/components/shared/BookGrid";
import Icon from "@/components/Icon";
import ProfileStaffTab from "./ProfileStaffTab";

const ProfileTabs = ({
  activeTab,
  onTabChange,
  userData,
  userBooks,
  archivedBooks,
  userShops = [],
  booksLoading,
  onCreateBook,
  onEditBook,
  onArchiveBook,
  archivingBookId,
}) => {
  const tProfile = useTranslations("ProfileDashboard");

  const renderEmptyState = (iconClass, title, subtitle) => (
    <div className="text-center py-60">
      <Icon className={`${iconClass} text-gray-300 text-5xl mb-16`}></Icon>
      <h5 className="text-gray-500 mb-0">{title}</h5>
      <p className="text-gray-400 text-sm mt-8">{subtitle}</p>
    </div>
  );

  const renderBooksTab = () => (
    <div className="p-3 p-md-4">
      <div className="profile-tabs__head">
        <div className="profile-tabs__head-title">
          <h3 className="text-xl text-md-2xl fw-bold text-gray-900 mb-0">{tProfile("myBooks")}</h3>
          <span className="badge bg-main-100 text-main-600 px-10 py-4 rounded-pill text-xs">
            {tProfile("activeBadge")}
          </span>
        </div>
        <button className="btn btn-main profile-tabs__head-cta" onClick={onCreateBook}>
          <Icon className="ph-bold ph-plus" aria-hidden="true" />
          <span className="profile-tabs__head-cta-label">{tProfile("addBook")}</span>
        </button>
      </div>
      <BookGrid
        books={userBooks}
        loading={booksLoading}
        skeletonCount={6}
        emptyState={renderEmptyState(
          "ph ph-books",
          tProfile("noBooksTitle"),
          tProfile("noBooksSubtitle"),
        )}
        renderCard={(book) => (
          <BookCard
            book={book}
            onEdit={onEditBook}
            currentUserId={userData?.id}
            showEditForOwn={true}
            onArchive={onArchiveBook}
            isArchiving={archivingBookId === book.id}
          />
        )}
      />
    </div>
  );

  const renderArchiveTab = () => (
    <div className="p-3 p-md-4">
      <div className="profile-tabs__head profile-tabs__head--single">
        <div className="profile-tabs__head-title">
          <h3 className="text-xl text-md-2xl fw-bold text-gray-900 mb-0">
            {tProfile("archiveTitle")}
          </h3>
          <span className="badge bg-gray-100 text-gray-600 px-10 py-4 rounded-pill text-xs">
            {tProfile("archiveBadge")}
          </span>
        </div>
      </div>
      <BookGrid
        books={archivedBooks}
        loading={booksLoading}
        skeletonCount={4}
        emptyState={renderEmptyState(
          "ph ph-archive",
          tProfile("noArchiveTitle"),
          tProfile("noArchiveSubtitle"),
        )}
        renderCard={(book) => (
          <BookCard
            book={book}
            onEdit={onEditBook}
            currentUserId={userData?.id}
            showEditForOwn={true}
          />
        )}
      />
    </div>
  );

  const hasShops = userShops.length > 0;

  const renderActiveTab = () => {
    if (activeTab === "archive") return renderArchiveTab();
    if (activeTab === "staff" && hasShops) {
      return <ProfileStaffTab shops={userShops} />;
    }
    return renderBooksTab();
  };

  return (
    <div className="profile-tabs rounded-16 border overflow-hidden">
      <div className="profile-tabs__nav-wrap">
        <nav className="profile-tabs__nav" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "books"}
            className={`profile-tabs__btn ${activeTab === "books" ? "is-active" : ""}`}
            onClick={() => onTabChange("books")}
          >
            <Icon className="ph ph-books" aria-hidden="true"></Icon>
            <span>{tProfile("booksTab")}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "archive"}
            className={`profile-tabs__btn ${activeTab === "archive" ? "is-active" : ""}`}
            onClick={() => onTabChange("archive")}
          >
            <Icon className="ph ph-archive" aria-hidden="true"></Icon>
            <span>{tProfile("archiveTab")}</span>
          </button>
          {hasShops && (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "staff"}
              className={`profile-tabs__btn ${activeTab === "staff" ? "is-active" : ""}`}
              onClick={() => onTabChange("staff")}
            >
              <Icon className="ph ph-users-three" aria-hidden="true"></Icon>
              <span>{tProfile("staffTab")}</span>
            </button>
          )}
        </nav>
      </div>
      <div>{renderActiveTab()}</div>
    </div>
  );
};

export default ProfileTabs;
