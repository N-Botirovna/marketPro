"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import BookCard from "./BookCard";
import { getUsedBooks } from "@/services/books";

const UsedBooksSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsedBooks = async () => {
      try {
        setLoading(true);
        const response = await getUsedBooks(8);
        setBooks(response.books);
      } catch (err) {
        console.error("Yangidek kitoblar yuklashda xatolik:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsedBooks();
  }, []);

  if (loading) {
    return (
      <section className="py-80 bg-gray-50">
        <div className="container container-lg">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-80 bg-gray-50">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-danger">
              Yangidek kitoblar yuklashda xatolik yuz berdi
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (!books || books.length === 0) {
    return (
      <section className="py-80 bg-gray-50">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-muted">Yangidek kitoblar topilmadi</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-80 bg-gray-50">
      <div className="container container-lg">
        <div className="section-heading text-center mb-48">
          <h2 className="section-heading__title">Yangidek kitoblar</h2>
          <p className="section-heading__desc">
            Arzon narxlarda Yangidek kitoblar
          </p>
        </div>

        <div className="row gy-4">
          {books.map((book) => (
            <div key={book.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
              <BookCard book={book} />
            </div>
          ))}
        </div>

        <div className="text-center mt-48">
          <Link href="/shop?type=used" className="btn btn-outline-main">
            Barcha Yangidek kitoblarni ko'rish
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UsedBooksSection;
