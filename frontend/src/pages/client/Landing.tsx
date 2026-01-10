import { useEffect } from "react";
import About from "@/components/client/About"
import Features from "@/components/client/Features"
import Footer from "@/components/client/Footer"
import Header from "@/components/client/Header"
import HeroSection from "@/components/client/HeroSection"
import Testimonials from "@/components/client/Testimonials"

const Landing = () => {
  // Smooth scroll behavior
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          e.preventDefault();
          const targetElement = document.querySelector(href);
          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  return (
    <div className="min-h-screen w-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Header />
      <main className="relative">
        <HeroSection />
        <Features />
        <About />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

export default Landing