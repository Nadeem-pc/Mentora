import About from "@/components/client/About"
import CTA from "@/components/client/CTA"
import Features from "@/components/client/Features"
import Footer from "@/components/client/Footer"
import Header from "@/components/client/Header"
import HeroSection from "@/components/client/HeroSection"
import Testimonials from "@/components/client/Testimonials"

const Landing = () => {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-x-hidden">
      <Header />
      <main className="scroll-smooth">
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