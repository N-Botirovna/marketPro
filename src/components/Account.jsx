import React from "react";
import Link from "next/link";

const Account = () => {
  return (
    <section className='account py-80'>
      <div className='container container-lg'>
        <form action='#'>
          <div className='row gy-4'>
            {/* Login Card Start */}
            <div className='col-xl-6 pe-xl-5'>
              <div className='border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40 h-100'>
                <h6 className='text-xl mb-32'>Login</h6>
                <div className='mb-24'>
                  <label
                    htmlFor='username'
                    className='text-neutral-900 text-lg mb-8 fw-medium'
                  >
                    Username or email address{" "}
                    <span className='text-danger'>*</span>{" "}
                  </label>
                  <input
                    type='text'
                    className='common-input'
                    id='username'
                    placeholder='First Name'
                  />
                </div>
                <div className='mb-24'>
                  <label
                    htmlFor='password'
                    className='text-neutral-900 text-lg mb-8 fw-medium'
                  >
                    Password
                  </label>
                  <div className='position-relative'>
                    <input
                      type='password'
                      className='common-input'
                      id='password'
                      placeholder='Enter Password'
                      defaultValue='password'
                    />
                    <span
                      className='toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ph-eye-slash'
                      id='#password'
                    />
                  </div>
                </div>
                <div className='mb-24 mt-48'>
                  <div className='flex-align gap-48 flex-wrap'>
                    <button type='submit' className='btn btn-main py-18 px-40'>
                      Log in
                    </button>
                    <div className='form-check common-check'>
                      <input
                        className='form-check-input'
                        type='checkbox'
                        defaultValue=''
                        id='remember'
                      />
                      <label
                        className='form-check-label flex-grow-1'
                        htmlFor='remember'
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                </div>
                <div className='mt-48'>
                  <Link
                    href='#'
                    className='text-danger-600 text-sm fw-semibold hover-text-decoration-underline'
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>
            {/* Login Card End */}
            {/* Register Card Start */}
            <div className='col-xl-6'>
              <div className='border border-gray-100 hover-border-main-600 transition-1 rounded-16 px-24 py-40'>
                <h6 className='text-xl mb-32'>Register</h6>
                <div className='mb-24'>
                  <label
                    htmlFor='usernameTwo'
                    className='text-neutral-900 text-lg mb-8 fw-medium'
                  >
                    Username <span className='text-danger'>*</span>{" "}
                  </label>
                  <input
                    type='text'
                    className='common-input'
                    id='usernameTwo'
                    placeholder='Write a username'
                  />
                </div>
                <div className='mb-24'>
                  <label
                    htmlFor='emailTwo'
                    className='text-neutral-900 text-lg mb-8 fw-medium'
                  >
                    Email address
                    <span className='text-danger'>*</span>{" "}
                  </label>
                  <input
                    type='email'
                    className='common-input'
                    id='emailTwo'
                    placeholder='Enter Email Address'
                  />
                </div>
                <div className='mb-24'>
                  <label
                    htmlFor='enter-password'
                    className='text-neutral-900 text-lg mb-8 fw-medium'
                  >
                    Password
                    <span className='text-danger'>*</span>
                  </label>
                  <div className='position-relative'>
                    <input
                      type='password'
                      className='common-input'
                      id='enter-password'
                      placeholder='Enter Password'
                      defaultValue='password'
                    />
                    <span
                      className='toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y cursor-pointer ph ph-eye-slash'
                      id='#enter-password'
                    />
                  </div>
                </div>
                <div className='my-48'>
                  <p className='text-gray-500'>
                    Your personal data will be used to process your order,
                    support your experience throughout this website, and for
                    other purposes described in our
                    <Link
                      href='#'
                      className='text-main-600 text-decoration-underline'
                    >
                      {" "}
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
                <div className='mt-48'>
                  <button type='submit' className='btn btn-main py-18 px-40'>
                    Register
                  </button>
                </div>
              </div>
            </div>
            {/* Register Card End */}
          </div>
        </form>
      </div>
    </section>
  );
};

export default Account;
