import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '@/components/shared/NotificationDropdown';
import logo from "@/assets/mentora-logo.jpeg"

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  // Scroll effect for enhanced appeal
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200' 
        : 'bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img
              src={logo}
              alt="Mentora logo"
              className="h-11 w-auto md:h-13 object-contain"
            />
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex text-sm items-center space-x-1">
            {[
              { name: 'About us', href: '/about', isRoute: true },
              { name: 'What We Offer', href: '/#services', isRoute: false },
              { name: 'Our Experts', href: '/therapists', isRoute: true },
              { name: 'Contact us', href: '/#contact', isRoute: false }
            ].map((item) => (
              item.isRoute ? (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                </button>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                </a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* Profile Icon */}
            <button
              onClick={() => navigate('/profile')}
              className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 group"
              aria-label="Profile"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
              {/* Online status badge (optional) */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Enhanced CTA Button */}
            {/* <button
              onClick={() => navigate('/auth/form')}
              className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              {/* Animated background */}
              {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Shine effect */}
              {/* <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button> */} 
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Profile Icon */}
            <button
              onClick={() => navigate('/profile')}
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
              aria-label="Profile"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              aria-label="Menu"
            >
              <svg 
                className={`w-6 h-6 transform transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-2">
              {[
                { name: 'Home', href: '#home', isRoute: false },
                { name: 'About us', href: '/about', isRoute: true },
                { name: 'Services', href: '/#services', isRoute: false },
                { name: 'Our Therapists', href: '/therapists', isRoute: true },
                { name: 'Contact', href: '#contact', isRoute: false }
              ].map((item) => (
                item.isRoute ? (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.href);
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                  >
                    {item.name}
                  </button>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                )
              ))}
              <button
                onClick={() => {
                  navigate('/auth/form');
                  setIsMenuOpen(false);
                }}
                className="mx-4 mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-full text-center shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;