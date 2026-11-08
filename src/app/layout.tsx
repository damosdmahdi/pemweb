import type { Metadata } from 'next';
import '../index.css';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'WorkNet — Sistem Pemesanan Ruang Kerja Gedung',
  description:
    'Platform peminjaman ruangan workspace fleksibel dalam satu gedung untuk freelancer, mahasiswa, komunitas, dan profesional.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col selection:bg-blue-600 selection:text-white">
        {/* Aksesibilitas: Tautan Lewati ke Konten Utama */}
        <a href="#main-content" className="skip-to-content">
          Lewati langsung ke konten utama
        </a>

        {/* Navigasi Utama */}
        <Navbar />

        {/* Konten Halaman */}
        <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 focus:outline-none">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
