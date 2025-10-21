import React from 'react'

const ShippingOne = () => {
    return (
        <section className="shipping mb-24" id="shipping">
            <div className="container container-lg">
                <div className="row gy-4">
                    <div className="col-xxl-3 col-sm-6">
                        <div className="shipping-item flex-align gap-16 rounded-16 bg-main-50 hover-bg-main-100 transition-2">
                            <span className="w-56 h-56 flex-center rounded-circle bg-main-600 text-white text-32 flex-shrink-0">
                                <i className="ph-fill ph-car-profile" />
                            </span>
                            <div className="">
                                <h6 className="mb-0">Bepul Yetkazib Berish</h6>
                                <span className="text-sm text-heading">
                                    O'zbekiston bo'ylab bepul yetkazib berish
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-3 col-sm-6">
                        <div className="shipping-item flex-align gap-16 rounded-16 bg-main-50 hover-bg-main-100 transition-2">
                            <span className="w-56 h-56 flex-center rounded-circle bg-main-600 text-white text-32 flex-shrink-0">
                                <i className="ph-fill ph-hand-heart" />
                            </span>
                            <div className="">
                                <h6 className="mb-0">100% Mijozlar Mamnunligi</h6>
                                <span className="text-sm text-heading">
                                    Sifatli kitoblar va xizmat kafolati
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-3 col-sm-6">
                        <div className="shipping-item flex-align gap-16 rounded-16 bg-main-50 hover-bg-main-100 transition-2">
                            <span className="w-56 h-56 flex-center rounded-circle bg-main-600 text-white text-32 flex-shrink-0">
                                <i className="ph-fill ph-credit-card" />
                            </span>
                            <div className="">
                                <h6 className="mb-0">Xavfsiz To'lov</h6>
                                <span className="text-sm text-heading">
                                    Turli xil to'lov usullari qo'llab-quvvatlanadi
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-xxl-3 col-sm-6">
                        <div className="shipping-item flex-align gap-16 rounded-16 bg-main-50 hover-bg-main-100 transition-2">
                            <span className="w-56 h-56 flex-center rounded-circle bg-main-600 text-white text-32 flex-shrink-0">
                                <i className="ph-fill ph-chats" />
                            </span>
                            <div className="">
                                <h6 className="mb-0">24/7 Qo'llab-quvvatlash</h6>
                                <span className="text-sm text-heading">
                                    Doimiy qo'llab-quvvatlash xizmati
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    )
}

export default ShippingOne