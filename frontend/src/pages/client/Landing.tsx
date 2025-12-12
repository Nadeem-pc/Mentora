import About from "@/components/client/About"
import CTA from "@/components/client/CTA"
import Features from "@/components/client/Features"
import Footer from "@/components/client/Footer"
import Header from "@/components/client/Header"
import HeroSection from "@/components/client/HeroSection"
import Testimonials from "@/components/client/Testimonials"

const Landing = () => {
  return (
    <div className="min-h-screen w-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <Features />
        <About />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

export default Landing