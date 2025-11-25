"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import BookCard from "./BookCard";
import Spin from "./Spin";
import { getUserById } from "@/services/auth";
import { getBooksByUser } from "@/services/books";

const UserPublicProfile = ({ userId }) => {
  const tProfile = useTranslations("ProfileDashboard");
  const tCommon = useTranslations("Common");
  const tUserProfile = useTranslations("UserPublicProfile");
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError(tUserProfile("notFound"));
      setLoadingUser(false);
      return;
    }

    let isMounted = true;
    setLoadingUser(true);
    setError(null);

    getUserById(userId)
      .then(({ user: fetchedUser }) => {
        if (!isMounted) return;
        if (!fetchedUser) {
          setError(tUserProfile("notFound"));
          setUser(null);
        } else {
          setUser(fetchedUser);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setError(tUserProfile("notFound"));
      })
      .finally(() => {
        if (isMounted) {
          setLoadingUser(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, tUserProfile]);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;
    setLoadingBooks(true);

    getBooksByUser(userId, 24)
      .then(({ books: userBooks }) => {
        if (!isMounted) return;
        setBooks(userBooks || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setBooks([]);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingBooks(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const fullName = useMemo(() => {
    if (!user) return "";
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length ? parts.join(" ") : tProfile("user");
  }, [user, tProfile]);

  const phoneNumber = user?.app_phone_number || tUserProfile("phoneHidden");
  const locationText =
    user?.location_text ||
    user?.point ||
    tUserProfile("locationFallback");

  if (loadingUser) {
    return (
      <div className="text-center py-80">
        <Spin text={tProfile("loadingData")} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-80 text-danger">{error}</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-80 text-gray-600">
        {tUserProfile("notFound")}
      </div>
    );
  }

  return (
    <section className="user-public-profile py-80">
      <div className="container container-lg">
        <div className="row gy-4">
          <div className="col-lg-4">
            <div className="bg-white border border-gray-100 rounded-16 shadow-sm p-32 h-100">
              <div className="text-center">
                <span className="d-inline-flex w-120 h-120 rounded-circle overflow-hidden bg-gray-50 mb-16">
                  <img
                    src={
                      user.picture || "/assets/images/thumbs/user-placeholder.png"
                    }
                    alt={fullName}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "/assets/images/thumbs/user-placeholder.png";
                    }}
                  />
                </span>
                <h4 className="text-gray-900 mb-4">{fullName}</h4>
                <p className="text-sm text-gray-500 mb-0">
                  {tProfile("user")}
                </p>
              </div>

              <div className="mt-32">
                <h6 className="text-sm text-gray-600 mb-12">
                  {tUserProfile("infoTitle")}
                </h6>
                <div className="d-flex flex-column gap-12">
                  <div className="d-flex align-items-center gap-12">
                    <span className="w-40 h-40 rounded-circle bg-main-50 text-main-600 flex-center">
                      <i className="ph ph-phone text-md" />
                    </span>
                    <div>
                      <p className="text-xs text-gray-500 mb-4">
                        {tProfile("phone")}
                      </p>
                      <p className="text-sm text-gray-900 mb-0">{phoneNumber}</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-12">
                    <span className="w-40 h-40 rounded-circle bg-main-50 text-main-600 flex-center">
                      <i className="ph ph-map-pin text-md" />
                    </span>
                    <div>
                      <p className="text-xs text-gray-500 mb-4">
                        {tCommon("location")}
                      </p>
                      <p className="text-sm text-gray-900 mb-0">
                        {locationText}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {user?.bio && (
                <div className="mt-32">
                  <h6 className="text-sm text-gray-600 mb-12">
                    {tProfile("bioTitle")}
                  </h6>
                  <p className="text-sm text-gray-600 mb-0">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-between mb-24 flex-wrap gap-12">
              <div>
                <h5 className="text-gray-900 mb-4">
                  {tUserProfile("booksHeading")}
                </h5>
                <span className="text-sm text-gray-500">
                  {tUserProfile("booksCount", { count: books.length })}
                </span>
              </div>
            </div>

            {loadingBooks ? (
              <div className="text-center py-40">
                <Spin text={tProfile("booksLoading")} />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-40 text-gray-600 bg-white border border-dashed border-gray-200 rounded-16">
                {tUserProfile("emptyBooks")}
              </div>
            ) : (
              <div className="list-grid-wrapper grid-cols-3">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} showEditForOwn={false} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserPublicProfile;


