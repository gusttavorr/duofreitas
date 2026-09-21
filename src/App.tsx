import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Storefront from './pages/Storefront';
import AdminPanel from './pages/AdminPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import CookieBanner from './components/CookieBanner';
import NewsletterModal from './components/NewsletterModal';
import AnnouncementBar from './components/AnnouncementBar';
import { useStore } from './store/useStore';
import { useAuthStore } from './store/useAuthStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthStore();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/admin" />;
  return <>{children}</>;
}

function App() {
  const { fetchSettings, fetchProducts } = useStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    fetchSettings();
    fetchProducts();
    checkAuth();
  }, [fetchSettings, fetchProducts, checkAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans bg-offwhite text-black transition-colors duration-300">
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
