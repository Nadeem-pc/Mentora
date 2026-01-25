import Footer from '@/components/client/Footer'
import Header from '@/components/client/Header'
import { Outlet } from 'react-router-dom'

const MarketingLayout = () => {
  return (
    <div className="flex flex-col min-h-screen w-screen">
      <Header />
      
      <main className="flex-1 pt-7">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  )
}

export default MarketingLayout