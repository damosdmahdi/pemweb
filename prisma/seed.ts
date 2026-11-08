import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data sintetis WorkNet...');

  // Hapus data lama jika ada (urutan: Booking dulu baru Room karena relasi)
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();

  // 1. Data Sintetis Ruangan (Room Entity)
  const roomData = [
    {
      id: 'room-focus-a1',
      name: 'Focus Pod A1',
      category: 'focus',
      categoryLabel: 'Focus Pod',
      floor: 1,
      capacity: 2,
      pricePerHour: 35000,
      description: 'Bilik kerja kedap suara berdesain ergonomis, dirancang khusus untuk freelancer dan pekerja remote yang memerlukan konsentrasi tinggi, call daring privat, atau sesi kerja solo tanpa distraksi.',
      facilities: ['Kedap Suara', 'Meja Ergonomis', 'Kursi Kerja Mesh', 'WiFi 100 Mbps', 'Stopkontak USB-C & AC'],
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
      area: '8 m²',
      wifiSpeed: '100 Mbps Dedicated',
      powerOutlets: 4,
      hasProjector: false,
      hasWhiteboard: true,
      hasSoundSystem: false,
      hasCoffeeAccess: true,
      rules: [
        'Menjaga tingkat kebisingan tetap minimal di koridor luar pod.',
        'Dilarang membawa makanan berkuah ke dalam pod.',
        'Harap mematikan pendingin udara dan lampu saat selesai menggunakan.',
      ],
    },
    {
      id: 'room-collab-b3',
      name: 'Collab Room B3',
      category: 'meeting',
      categoryLabel: 'Meeting Room',
      floor: 2,
      capacity: 6,
      pricePerHour: 75000,
      description: 'Ruang rapat kolaboratif berukuran sedang yang dilengkapi monitor 4K 55 inch dan papan tulis magnetik lebar. Sangat cocok untuk rapat koordinasi tim, presentasi klien, maupun diskusi skripsi mahasiswa.',
      facilities: ['Smart TV 55 Inch', 'Glass Whiteboard', 'HDMI & Type-C Converter', 'WiFi 200 Mbps', 'AC Daikin Inverter'],
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      area: '18 m²',
      wifiSpeed: '200 Mbps Dedicated',
      powerOutlets: 8,
      hasProjector: true,
      hasWhiteboard: true,
      hasSoundSystem: true,
      hasCoffeeAccess: true,
      rules: [
        'Gunakan spidol whiteboard khusus yang telah disediakan.',
        'Kembalikan kabel proyektor/TV ke rak kabel setelah selesai.',
        'Toleransi keterlambatan check-out maksimal 10 menit.',
      ],
    },
    {
      id: 'room-exec-c1',
      name: 'Executive Boardroom C1',
      category: 'meeting',
      categoryLabel: 'Meeting Room',
      floor: 3,
      capacity: 14,
      pricePerHour: 180000,
      description: 'Ruang rapat premium dengan kursi kulit eksekutif, sistem video conference Logitech Rally Bar, dan pencahayaan otomatis. Ideal untuk pertemuan investor, presentasi korporat, dan rapat formal.',
      facilities: ['Logitech Video Conf 4K', 'Mic Array Ceiling', 'Dual Screen TV 65 Inch', 'WiFi 300 Mbps', 'Mini Kulkas & Mineral Water'],
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
      area: '36 m²',
      wifiSpeed: '300 Mbps Fiber',
      powerOutlets: 16,
      hasProjector: true,
      hasWhiteboard: true,
      hasSoundSystem: true,
      hasCoffeeAccess: true,
      rules: [
        'Penyewa diwajibkan melakukan konfirmasi kehadiran 15 menit sebelum waktu mulai.',
        'Harap menjaga kebersihan meja kayu jati dan perangkat audio konferensi.',
        'Layanan catering harus berkoordinasi terlebih dahulu dengan resepsionis.',
      ],
    },
    {
      id: 'room-studio-d2',
      name: 'Creative Studio D2',
      category: 'team',
      categoryLabel: 'Team Office',
      floor: 2,
      capacity: 8,
      pricePerHour: 120000,
      description: 'Ruang kerja bertema kreatif yang fleksibel dengan dinding akustik, meja standing yang bisa diatur, dan perlengkapan pencahayaan softbox. Cocok untuk tim desain, content creator, atau startup digital.',
      facilities: ['Standing Desk', 'Acoustic Wall Panels', 'Ring Light & Softbox', 'High-Speed Fiber 250 Mbps', 'Dispenser & Tea Bar'],
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
      area: '24 m²',
      wifiSpeed: '250 Mbps Fiber',
      powerOutlets: 12,
      hasProjector: false,
      hasWhiteboard: true,
      hasSoundSystem: true,
      hasCoffeeAccess: true,
      rules: [
        'Alat pencahayaan studio harus dimatikan saat meninggalkan ruangan.',
        'Dilarang menempelkan selotip non-kertas pada dinding akustik.',
        'Buang sampah pada tempat pemilahan daur ulang di koridor.',
      ],
    },
    {
      id: 'room-team-e4',
      name: 'Dedicated Team Suite E4',
      category: 'team',
      categoryLabel: 'Team Office',
      floor: 4,
      capacity: 12,
      pricePerHour: 150000,
      description: 'Kantor privat untuk tim yang membutuhkan ruang kerja harian atau mingguan. Dilengkapi loker pribadi, papan kanban fisik, dan akses kartu kunci pintar untuk privasi maksimal.',
      facilities: ['Smart Door Lock', 'Locker Penyimpanan', 'Physical Kanban Board', 'Router Wi-Fi Privat', 'Pantry Akses Cepat'],
      available: false,
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      area: '32 m²',
      wifiSpeed: '300 Mbps Dedicated',
      powerOutlets: 18,
      hasProjector: false,
      hasWhiteboard: true,
      hasSoundSystem: false,
      hasCoffeeAccess: true,
      rules: [
        'Kunci kartu akses fisik/digital dilarang dipinjamkan ke luar tim terdaftar.',
        'Pembersihan ruangan dilakukan otomatis setiap hari pada pukul 19.00 WIB.',
        'Ruangan berstatus sewa privat hingga akhir bulan.',
      ],
    },
    {
      id: 'room-hall-f1',
      name: 'WorkNet Hall & Community Space',
      category: 'event',
      categoryLabel: 'Event Hall',
      floor: 1,
      capacity: 45,
      pricePerHour: 350000,
      description: 'Aula serbaguna dengan tata letak amfiteater dan panggung mini. Pilihan tepat untuk seminar, workshop teknologi, sesi meetup komunitas pegiat IT, dan demo day proyek inovasi.',
      facilities: ['Laser Projector 5000 Lumens', 'Wireless Mics (4 unit)', 'Sound System JBL Pro', 'Podium & Stage Lighting', 'Area Foyer Registrasi'],
      available: true,
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      area: '90 m²',
      wifiSpeed: '500 Mbps Dedicated',
      powerOutlets: 24,
      hasProjector: true,
      hasWhiteboard: true,
      hasSoundSystem: true,
      hasCoffeeAccess: true,
      rules: [
        'Penyelenggara wajib didampingi teknisi audio/visual gedung WorkNet.',
        'Batas maksimal kapasitas pengunjung adalah 50 orang demi keselamatan evakuasi.',
        'Registrasi acara komunitas minimal diajukan 3 hari sebelumnya.',
      ],
    },
  ];

  for (const r of roomData) {
    await prisma.room.create({ data: r });
  }
  console.log(`✅ Berhasil menambahkan ${roomData.length} data ruangan.`);

  // 2. Data Sintetis Reservasi (Booking Entity - Berelasi dengan Room)
  const bookingData = [
    {
      bookingCode: 'WN-20261101-1001',
      fullName: 'Ahmad Pratama',
      email: 'ahmad.pratama@synthetic-mail.test',
      phone: '081234567891',
      userCategory: 'freelancer',
      roomId: 'room-focus-a1',
      date: '2026-11-10',
      startTime: '09:00',
      endTime: '12:00',
      durationHours: 3,
      attendees: 1,
      totalCost: 105000,
      notes: 'Memerlukan koneksi stabil untuk interview jarak jauh.',
      status: 'CONFIRMED',
    },
    {
      bookingCode: 'WN-20261102-1002',
      fullName: 'Siti Rahmawati',
      email: 'siti.rahmawati@synthetic-mail.test',
      phone: '081298765432',
      userCategory: 'mahasiswa',
      roomId: 'room-collab-b3',
      date: '2026-11-11',
      startTime: '13:00',
      endTime: '16:00',
      durationHours: 3,
      attendees: 5,
      totalCost: 225000,
      notes: 'Diskusi persiapan sidang capstone project informatika.',
      status: 'CONFIRMED',
    },
    {
      bookingCode: 'WN-20261103-1003',
      fullName: 'Budi Wicaksono',
      email: 'budi.wicaksono@synthetic-mail.test',
      phone: '081377889900',
      userCategory: 'profesional',
      roomId: 'room-exec-c1',
      date: '2026-11-12',
      startTime: '10:00',
      endTime: '12:00',
      durationHours: 2,
      attendees: 10,
      totalCost: 360000,
      notes: 'Rapat koordinasi bulanan tim manajemen startup.',
      status: 'CONFIRMED',
    },
  ];

  for (const b of bookingData) {
    await prisma.booking.create({ data: b });
  }
  console.log(`✅ Berhasil menambahkan ${bookingData.length} data reservasi berelasi.`);
  console.log('🎉 Seeding selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal menjalankan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
