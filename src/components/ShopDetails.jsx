"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getShopById } from "@/services/shops";

const ShopDetails = ({ shopId }) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (shopId) {
      fetchShopDetails();
    }
  }, [shopId]);

  const fetchShopDetails = async () => {
    try {
      setLoading(true);
      const response = await getShopById(shopId);
      setShop(response.shop);
    } catch (err) {
      console.error('Do\'kon tafsilotlari yuklashda xatolik:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (star) => {
    const rating = parseFloat(star) || 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="d-flex align-items-center gap-4">
        {[...Array(fullStars)].map((_, i) => (
          <i key={i} className="ph ph-star-fill text-warning"></i>
        ))}
        {hasHalfStar && (
          <i className="ph ph-star-half-fill text-warning"></i>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={i} className="ph ph-star text-gray-300"></i>
        ))}
        <span className="text-sm text-gray-500">({star})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <section className='py-80'>
        <div className='container container-lg'>
          <div className='text-center'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='py-80'>
        <div className='container container-lg'>
          <div className='text-center'>
            <p className='text-danger'>Do'kon tafsilotlari yuklashda xatolik yuz berdi</p>
          </div>
        </div>
      </section>
    );
  }

  if (!shop) {
    return (
      <section className='py-80'>
        <div className='container container-lg'>
          <div className='text-center'>
            <p className='text-muted'>Do'kon topilmadi</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='py-80'>
      <div className='container container-lg'>
        <div className='row gy-5'>
          <div className='col-lg-4'>
            {/* Shop Image */}
            <div className='shop-details__thumb'>
              <img
                src={shop.picture || '/assets/images/thumbs/shop-placeholder.png'}
                alt={shop.name}
                className='w-100 rounded-16'
                style={{ height: '400px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = '/assets/images/thumbs/shop-placeholder.png';
                }}
              />
            </div>
          </div>

          <div className='col-lg-8'>
            <div className='shop-details__content'>
              {/* Shop Name */}
              <h1 className='shop-details__title text-3xl fw-bold mb-16'>
                {shop.name || 'Do\'kon nomi'}
              </h1>

              {/* Bio */}
              {shop.bio && (
                <div className='mb-24'>
                  <p className='text-gray-700 line-height-1-6'>
                    {shop.bio}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className='row mb-24'>
                <div className='col-md-6'>
                  {shop.phone_number && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-phone me-4'></i>
                        Telefon:
                      </span>
                      <a href={`tel:${shop.phone_number}`} className='fw-medium'>
                        {shop.phone_number}
                      </a>
                    </div>
                  )}

                  {shop.telegram && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-telegram-logo me-4'></i>
                        Telegram:
                      </span>
                      <a href={`https://t.me/${shop.telegram}`} target='_blank' rel='noopener noreferrer' className='fw-medium'>
                        @{shop.telegram}
                      </a>
                    </div>
                  )}

                  {shop.instagram && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-instagram-logo me-4'></i>
                        Instagram:
                      </span>
                      <a href={`https://instagram.com/${shop.instagram}`} target='_blank' rel='noopener noreferrer' className='fw-medium'>
                        @{shop.instagram}
                      </a>
                    </div>
                  )}

                  {shop.website && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-globe me-4'></i>
                        Veb-sayt:
                      </span>
                      <a href={shop.website} target='_blank' rel='noopener noreferrer' className='fw-medium'>
                        {shop.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className='col-md-6'>
                  {shop.location_text && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-map-pin me-4'></i>
                        Manzil:
                      </span>
                      <span className='fw-medium'>{shop.location_text}</span>
                    </div>
                  )}

                  {shop.working_days && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-calendar me-4'></i>
                        Ish kunlari:
                      </span>
                      <span className='fw-medium'>{shop.working_days}</span>
                    </div>
                  )}

                  {shop.working_hours && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-clock me-4'></i>
                        Ish vaqti:
                      </span>
                      <span className='fw-medium'>{shop.working_hours}</span>
                    </div>
                  )}

                  {shop.lunch && (
                    <div className='mb-16'>
                      <span className='text-gray-600 me-8'>
                        <i className='ph ph-fork-knife me-4'></i>
                        Tushlik:
                      </span>
                      <span className='fw-medium'>{shop.lunch}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Services */}
              <div className='mb-24'>
                <h6 className='mb-12'>Xizmatlar:</h6>
                <div className='d-flex flex-wrap gap-12'>
                  {shop.has_post_service && (
                    <span className='badge bg-success'>
                      <i className='ph ph-truck me-4'></i>
                      Yetkazib berish
                    </span>
                  )}
                  <span className='badge bg-primary'>
                    <i className='ph ph-books me-4'></i>
                    Kitoblar
                  </span>
                  {shop.is_active && (
                    <span className='badge bg-success'>
                      <i className='ph ph-check-circle me-4'></i>
                      Faol
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className='d-flex gap-16 flex-wrap'>
                <Link href={`/shop/${shop.id}/books`} className='btn btn-main px-32 py-16'>
                  <i className='ph ph-books me-8'></i>
                  Kitoblarni ko'rish
                </Link>
                {shop.phone_number && (
                  <a href={`tel:${shop.phone_number}`} className='btn btn-outline-main px-32 py-16'>
                    <i className='ph ph-phone me-8'></i>
                    Qo'ng'iroq qilish
                  </a>
                )}
                {shop.telegram && (
                  <a href={`https://t.me/${shop.telegram}`} target='_blank' rel='noopener noreferrer' className='btn btn-outline-info px-32 py-16'>
                    <i className='ph ph-telegram-logo me-8'></i>
                    Telegram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className='row mt-80'>
          <div className='col-12'>
            <div className='border border-gray-100 rounded-16 p-32'>
              <h5 className='mb-24'>Qo'shimcha ma'lumotlar</h5>
              <div className='row'>
                <div className='col-md-6'>
                  <div className='mb-16'>
                    <strong>Holati:</strong> {shop.is_active ? 'Faol' : 'Nofaol'}
                  </div>
                  {shop.point && (
                    <div className='mb-16'>
                      <strong>Koordinatalar:</strong> {shop.point}
                    </div>
                  )}
                </div>
                <div className='col-md-6'>
                  {shop.district && (
                    <div className='mb-16'>
                      <strong>Tuman:</strong> {shop.district}
                    </div>
                  )}
                  {shop.region && (
                    <div className='mb-16'>
                      <strong>Viloyat:</strong> {shop.region}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopDetails;
