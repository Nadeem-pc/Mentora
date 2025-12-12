import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section id="home" className="pt-20 pb-16 bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your Mental
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-400">
                  {" "}Wellbeing{" "}
                </span>
                Matters
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Connect with certified mental health professionals in a safe, confidential environment. 
                Take the first step towards better mental health today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition-colors font-medium text-center"
              >
                Start Your Journey
              </a>
              <a
                href="#services"
                className="border border-green-600 text-green-600 px-8 py-4 rounded-full hover:bg-green-50 transition-colors font-medium text-center"
              >
                Learn More
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Licensed Therapists</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support Available</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            {/* <div className="w-full h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-3xl flex items-center justify-center">
              <div className="text-center text-green-700">
                <svg className="w-32 h-32 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.1 14.1 11 13 11V22H11V16H9V22H7V11C5.9 11 5 10.1 5 9V7H3V9C3 11.2 4.8 13 7 13V20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20V13C19.2 13 21 11.2 21 9Z"/>
                </svg>
                <p className="text-lg font-medium">Mental Health Support</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;