import React from "react";
import Link from "next/link";

const FooterOne = () => {
  return (
    <footer className='footer py-120'>
      <img
        src='assets/images/bg/body-bottom-bg.png'
        alt='BG'
        className='body-bottom-bg'
      />
      <div className='container container-lg'>
        <div className='footer-item-wrapper d-flex align-items-start flex-wrap'>
          <div className='footer-item'>
            <div className='footer-item__logo'>
              <Link href='/'>
                {" "}
                <img src='assets/images/logo/logo.png' alt='' />
              </Link>
            </div>
            <p className='mb-24'>
              Biz Kitobzor - innovatsion kitob do'koni va kitob sotuvchilari jamoasi.
            </p>
            <div className='flex-align gap-16 mb-16'>
              <span className='w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0'>
                <i className='ph-fill ph-map-pin' />
              </span>
              <span className='text-md text-gray-900 '>
                789 Inner Lane, Biyes park, California, USA
              </span>
            </div>
            <div className='flex-align gap-16 mb-16'>
              <span className='w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0'>
                <i className='ph-fill ph-phone-call' />
              </span>
              <div className='flex-align gap-16 flex-wrap'>
                <a
                  href='tel:+00123456789'
                  className='text-md text-gray-900 hover-text-main-600'
                >
                  +00 123 456 789
                </a>
                <span className='text-md text-main-600 '>or</span>
                <Link
                  href='tel:+00987654012'
                  className='text-md text-gray-900 hover-text-main-600'
                >
                  +00 987 654 012
                </Link>
              </div>
            </div>
            <div className='flex-align gap-16 mb-16'>
              <span className='w-32 h-32 flex-center rounded-circle bg-main-600 text-white text-md flex-shrink-0'>
                <i className='ph-fill ph-envelope' />
              </span>
              <Link
                href='/mailto:support24@marketpro.com'
                className='text-md text-gray-900 hover-text-main-600'
              >
                support24@marketpro.com
              </Link>
            </div>
          </div>
          <div className='footer-item'>
            <h6 className='footer-item__title'>Ma'lumot</h6>
            <ul className='footer-menu'>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Sotuvchi bo'lish
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Hamkorlik dasturi
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Maxfiylik siyosati
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Bizning yetkazib beruvchilar
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Kengaytirilgan reja
                </Link>
              </li>
              <li className=''>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Jamiyat
                </Link>
              </li>
            </ul>
          </div>
          <div className='footer-item'>
            <h6 className='footer-item__title'>Mijozlar uchun yordam</h6>
            <ul className='footer-menu'>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Yordam markazi
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/contact'
                  className='text-gray-600 hover-text-main-600'
                >
                  Biz bilan bog'lanish
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Shikoyat qilish
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Ariza va nizolar
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Qoidalar va tartib
                </Link>
              </li>
              <li className=''>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Onlayn xarid
                </Link>
              </li>
            </ul>
          </div>
          <div className='footer-item'>
            <h6 className='footer-item__title'>Mening hisobim</h6>
            <ul className='footer-menu'>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Mening hisobim
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Buyurtmalar tarixi
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Savat
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Taqqoslash
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Yordam chiptasi
                </Link>
              </li>
              <li className=''>
                <Link
                  href='/wishlist'
                  className='text-gray-600 hover-text-main-600'
                >
                  Sevimlilar
                </Link>
              </li>
            </ul>
          </div>
          <div className='footer-item'>
            <h6 className='footer-item__title'>Kategoriyalar</h6>
            <ul className='footer-menu'>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Diniy adabiyot
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Badiiy adabiyot
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Bolalar adabiyoti
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  O'quv adabiyoti
                </Link>
              </li>
              <li className='mb-16'>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Ilmiy adabiyot
                </Link>
              </li>
              <li className=''>
                <Link
                  href='/shop'
                  className='text-gray-600 hover-text-main-600'
                >
                  Texnika adabiyoti
                </Link>
              </li>
            </ul>
          </div>
          <div className='footer-item'>
            <h6 className=''>Har joyda xarid qiling</h6>
            <p className='mb-16'>Kitobzor ilovasi mavjud. Hozir oling</p>
            <div className='flex-align gap-8 my-32'>
              <Link href='/https://www.apple.com/store' className=''>
                <img src='assets/images/thumbs/store-img1.png' alt='' />
              </Link>
              <Link
                href='/https://play.google.com/store/apps?hl=en'
                className=''
              >
                <img src='assets/images/thumbs/store-img2.png' alt='' />
              </Link>
            </div>
            <ul className='flex-align gap-16'>
              <li>
                <Link
                  href='/https://www.facebook.com'
                  className='w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white'
                >
                  <i className='ph-fill ph-facebook-logo' />
                </Link>
              </li>
              <li>
                <Link
                  href='/https://www.twitter.com'
                  className='w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white'
                >
                  <i className='ph-fill ph-twitter-logo' />
                </Link>
              </li>
              <li>
                <Link
                  href='/https://www.linkedin.com'
                  className='w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white'
                >
                  <i className='ph-fill ph-instagram-logo' />
                </Link>
              </li>
              <li>
                <Link
                  href='/https://www.pinterest.com'
                  className='w-44 h-44 flex-center bg-main-100 text-main-600 text-xl rounded-circle hover-bg-main-600 hover-text-white'
                >
                  <i className='ph-fill ph-linkedin-logo' />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOne;
