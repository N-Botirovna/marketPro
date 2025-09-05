"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import BookCard from "./BookCard";
import { getNewBooks } from "@/services/books";

const NewBooksSection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewBooks = async () => {
      try {
        setLoading(true);
        const response = await getNewBooks(8);
        setBooks(response.books);
      } catch (err) {
        console.error('Yangi kitoblar yuklashda xatolik:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewBooks();
  }, []);

  if (loading) {
    return (
      <section className="py-80">
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
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-danger">Yangi kitoblar yuklashda xatolik yuz berdi</p>
          </div>
        </div>
      </section>
    );
  }

  if (!books || books.length === 0) {
    return (
      <section className="py-80">
        <div className="container container-lg">
          <div className="text-center">
            <p className="text-muted">Yangi kitoblar topilmadi</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-80">
      <div className="container container-lg">
        <div className="section-heading text-center mb-48">
          <h2 className="section-heading__title">Yangi kitoblar</h2>
          <p className="section-heading__desc">
            Eng so'nggi qo'shilgan kitoblar
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
          <Link href="/shop" className="btn btn-main">
            Barcha kitoblarni ko'rish
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewBooksSection;
