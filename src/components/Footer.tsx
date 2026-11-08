import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Kolom 1: Profil Gedung */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">WorkNet</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Gedung workspace modern 5 lantai yang didedikasikan untuk ruang kerja privat, ruang rapat kolaboratif, podcast studio, dan aula acara komunitas.
            </p>
            <div className="text-xs text-slate-400 space-y-1 pt-1">
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-300">Lokasi:</span> Jl. Inovasi Sains No. 12, Kompleks Teknologi Terpadu
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-300">Jam Operasional:</span> Senin – Minggu, 07.00 – 22.00 WIB
              </p>
            </div>
          </div>

          {/* Kolom 2: Sasaran Pengguna */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Sasaran Pengguna
            </h4>
            <ul className="text-sm space-y-2 text-slate-400">
              <li>Freelancer & Remote Worker</li>
              <li>Mahasiswa & Peneliti</li>
              <li>Komunitas Kreatif & IT</li>
              <li>Pekerja Profesional & Startup</li>
            </ul>
          </div>

          {/* Kolom 3: Layanan & Fasilitas */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
              Fasilitas Gedung
            </h4>
            <ul className="text-sm space-y-2 text-slate-400">
              <li>Dedicated Fiber Optic High-Speed</li>
              <li>Akses Kartu RFID Smart Lock</li>
              <li>Free Pantry, Kopi & Teh</li>
              <li>Area Parkir Luas & Keamanan 24 Jam</li>
            </ul>
          </div>
        </div>

        {/* Baris Bawah: Hak Cipta & Info Mata Kuliah */}
        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WorkNet. Tugas 1 — Milestone 1 Pengembangan Aplikasi Web.</p>
          <p className="text-slate-400">
            Dibuat menggunakan <span className="text-blue-400 font-medium">React</span>, <span className="text-blue-400 font-medium">TypeScript</span>, & <span className="text-blue-400 font-medium">Tailwind CSS</span>.
          </p>
        </div>
      </div>
    </footer>
  );
};
