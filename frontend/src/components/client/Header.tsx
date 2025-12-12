import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();

  // Add scroll effect for enhanced appeal
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Container with padding to create the "floating" effect */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className={`max-w-6xl mx-auto transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border border-white/20' 
            : 'bg-white/90 backdrop-blur-md shadow-md border border-gray-100'
        } rounded-4xl`}>
          
          <div className="px-6 py-3">
            <div className="flex justify-between items-center">
              
              {/* Enhanced Logo */}
              <div className="flex items-center group cursor-pointer">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.1 14.1 11 13 11V22H11V16H9V22H7V11C5.9 11 5 10.1 5 9V7H3V9C3 11.2 4.8 13 7 13V20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20V13C19.2 13 21 11.2 21 9Z"/>
                    </svg>
                  </div>
                  {/* Animated glow effect */}
                  <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  Mentora
                </span>
              </div>

              {/* Enhanced Desktop Navigation */}
              <nav className="hidden md:flex text-sm items-center space-x-1">
                {[
                  { name: 'About us', href: '#about' },
                  { name: 'Services', href: '#services' },
                  { name: 'Experts', href: '/therapists' },
                  { name: 'Assessments', href: '#therapists' },
                  { name: 'Contact us', href: '' }
                ].map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium relative group"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                  </a>
                ))}
              </nav>

              {/* Enhanced CTA Section */}
              <div className="hidden md:flex items-center space-x-4">

                {/* Enhanced CTA Button */}
                <a
                  href="#contact"
                  className="relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden"
                >
                  <span className="relative z-10" onClick={navigate('/auth/form')}>Get Started</span>
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Shine effect */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </a>
              </div>

              {/* Enhanced Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
              isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="py-4 border-t border-gray-100">
                <div className="flex flex-col space-y-3">
                  {[
                    { name: 'Home', href: '#home' },
                    { name: 'About us', href: '#about' },
                    { name: 'Services', href: '#services' },
                    { name: 'Our Therapists', href: '#therapists' },
                    { name: 'Contact', href: '#contact' }
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    className="mx-4 mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full text-center shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;