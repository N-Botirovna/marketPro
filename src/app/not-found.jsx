import Link from "next/link";

export default function NotFound() {
  return (
    <section className='py-5 d-flex justify-content-center align-items-center overflow-hidden not__found'>
      <div className='container container-two'>
        <div className='row justify-content-center'>
          <div className='col-lg-6 col-md-8 col-sm-10'>
            <div className='cart-thank__content text-center'>
              <h2 className='cart-thank__title mb-48'>PAGE NOT FOUND!</h2>
              <div className='text-file'>
                <p>
                  Sorry we can't find that page! The page you are looking
                  <br />
                  for was never existed.
                </p>
              </div>
              <div className='d-adjust'>
                <Link
                  className='default-btn btn btn-main d-inline-flex align-items-center rounded-pill gap-8'
                  href='/'
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
