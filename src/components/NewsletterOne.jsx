"use client";
import { Link } from '@/i18n/navigation'
import React from 'react'
import { useTranslations } from 'next-intl'


const NewsletterOne = () => {
    const t = useTranslations('NewsletterOne')
    
    return (
        <div className="newsletter my-18">
            <div className="container container-lg">
                <div className="newsletter-box position-relative rounded-16 flex-align gap-16 flex-wrap z-1">
                    <img
                        src="assets/images/bg/newsletter-bg.png"
                        alt="newsletter background"
                        className="position-absolute inset-block-start-0 inset-inline-start-0 z-n1 w-100 h-100 opacity-6"
                    />
                    <div className="row align-items-center">
                        <div className="col-xl-6">
                            <div className="">
                                <h1 className="text-white mb-12">
                                    {t('title')}
                                </h1>
                                <p className="text-white h5 mb-0">
                                    {t('subtitle')}
                                </p>
                                <p className="text-white mb-24 mt-16">
                                    {t('description')}
                                </p>
                                <Link
                                    href="/become-seller"
                                    className="btn btn-main-two rounded-pill d-inline-flex align-items-center gap-8 py-22 px-32"
                                >
                                    <i className="ph ph-store text-xl"></i>
                                    {t('buttonText')}
                                </Link>
                            </div>
                        </div>
                        <div className="col-xl-6 text-center d-xl-block d-none">
                            <img src="assets/images/thumbs/newsletter-img.png" alt="newsletter books" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default NewsletterOne