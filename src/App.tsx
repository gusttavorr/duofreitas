import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Storefront from './pages/Storefront';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CookieBanner from './components/CookieBanner';
import NewsletterModal from './components/NewsletterModal';
import AnnouncementBar from './components/AnnouncementBar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-offwhite text-black">
        <AnnouncementBar />
        <Header />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Storefront />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        
        <Footer />
        <CartSidebar />
        <CookieBanner />
        <NewsletterModal />
      </div>
    </BrowserRouter>
  );
}

export default App;
