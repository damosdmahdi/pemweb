import React, { useState } from 'react';
import type { PageType } from './types';
import { MOCK_ROOMS } from './data/mockRooms';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CatalogPage } from './pages/CatalogPage';
import { DetailPage } from './pages/DetailPage';
import { BookingPage } from './pages/BookingPage';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<PageType>('catalog');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(MOCK_ROOMS[0].id);

  // Navigasi ke halaman detail dengan ID ruangan tertentu
  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActivePage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigasi langsung ke formulir booking dengan ID ruangan tertentu
  const handleBookRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setActivePage('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: PageType) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Aksesibilitas: Tautan Lewati ke Konten Utama untuk Navigasi Keyboard */}
      <a href="#main-content" className="skip-to-content">
        Lewati langsung ke konten utama
      </a>

      {/* Navigasi Utama */}
      <Navbar activePage={activePage} onNavigate={handleNavigate} />

      {/* Konten Halaman Aktif */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
        {activePage === 'catalog' && (
          <CatalogPage
            rooms={MOCK_ROOMS}
            onSelectRoom={handleSelectRoom}
            onBookRoom={handleBookRoom}
          />
        )}

        {activePage === 'detail' && (
          <DetailPage
            rooms={MOCK_ROOMS}
            selectedRoomId={selectedRoomId}
            onSelectRoomId={(id) => setSelectedRoomId(id)}
            onNavigateToCatalog={() => handleNavigate('catalog')}
            onNavigateToBooking={handleBookRoom}
          />
        )}

        {activePage === 'booking' && (
          <BookingPage
            rooms={MOCK_ROOMS}
            initialRoomId={selectedRoomId}
            onNavigateToCatalog={() => handleNavigate('catalog')}
          />
        )}
      </main>

      {/* Footer Aplikasi */}
      <Footer />
    </div>
  );
};

export default App;
