import mongoose from 'mongoose';
import dotenv from 'dotenv';
import StudyGroup from '../models/StudyGroup.js';
import User from '../models/User.js';
import Document from '../models/Document.js';

dotenv.config();

const seedStudyGroups = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/knowledge_hub');
    console.log('Connected to MongoDB');

    // Get existing users and documents
    const users = await User.find({});
    const documents = await Document.find({});

    if (users.length < 3 || documents.length < 3) {
      console.log('Please run seed.js first to create users and documents');
      process.exit(1);
    }

    // Clear existing study groups
    await StudyGroup.deleteMany({});
    console.log('Cleared existing study groups');

    // Create diverse study groups
    const studyGroups = await StudyGroup.create([
      {
        nama: 'Algoritma dan Pemrograman',
        deskripsi: 'Kelompok belajar untuk mata kuliah Algoritma dan Pemrograman. Fokus pada problem solving dan competitive programming.',
        kategori: 'programming',
        anggota: [users[0]._id, users[1]._id, users[2]._id],
        admin: users[0]._id,
        isPublic: true,
        documents: [documents[0]._id, documents[1]._id],
        maksAnggota: 25,
        jadwalPertemuan: [
          {
            hari: 'Senin',
            waktu: '19:00',
            lokasi: 'Online - Google Meet'
          },
          {
            hari: 'Kamis',
            waktu: '19:00',
            lokasi: 'Lab Komputer 3'
          }
        ]
      },
      {
        nama: 'Database Masters',
        deskripsi: 'Mendalami konsep database, SQL, dan NoSQL. Persiapan sertifikasi database administrator.',
        kategori: 'database',
        anggota: [users[1]._id, users[3]._id],
        admin: users[1]._id,
        isPublic: true,
        documents: [documents[2]._id],
        maksAnggota: 20,
        jadwalPertemuan: [
          {
            hari: 'Selasa',
            waktu: '16:00',
            lokasi: 'Ruang Diskusi Perpustakaan'
          }
        ]
      },
      {
        nama: 'AI/ML Research Group',
        deskripsi: 'Kelompok riset mahasiswa tentang Artificial Intelligence dan Machine Learning. Open for all levels!',
        kategori: 'research',
        anggota: [users[2]._id, users[3]._id, users[4]._id],
        admin: users[2]._id,
        isPublic: true,
        documents: documents.filter(doc => doc.tags.includes('machine-learning')),
        maksAnggota: 30,
        jadwalPertemuan: [
          {
            hari: 'Rabu',
            waktu: '15:00',
            lokasi: 'Lab AI - Gedung FTIK'
          },
          {
            hari: 'Sabtu',
            waktu: '10:00',
            lokasi: 'Online - Discord'
          }
        ]
      },
      {
        nama: 'Mobile Dev Indonesia',
        deskripsi: 'Belajar development aplikasi mobile dengan React Native dan Flutter',
        kategori: 'mobile-development',
        anggota: [users[0]._id, users[2]._id, users[4]._id],
        admin: users[4]._id,
        isPublic: true,
        documents: [],
        maksAnggota: 35,
        jadwalPertemuan: [
          {
            hari: 'Jumat',
            waktu: '16:00',
            lokasi: 'Co-working Space Kampus'
          }
        ]
      },
      {
        nama: 'Cyber Security Club',
        deskripsi: 'Learn ethical hacking, penetration testing, and cybersecurity best practices',
        kategori: 'security',
        anggota: [users[1]._id, users[3]._id],
        admin: users[3]._id,
        isPublic: false,
        documents: [],
        maksAnggota: 15,
        jadwalPertemuan: [
          {
            hari: 'Sabtu',
            waktu: '13:00',
            lokasi: 'Security Lab'
          }
        ]
      },
      {
        nama: 'UX/UI Design Community',
        deskripsi: 'Komunitas desainer UI/UX. Sharing session, workshop, dan portfolio review.',
        kategori: 'design',
        anggota: users.slice(0, 3).map(u => u._id),
        admin: users[0]._id,
        isPublic: true,
        documents: [],
        maksAnggota: 40,
        jadwalPertemuan: [
          {
            hari: 'Selasa',
            waktu: '18:00',
            lokasi: 'Design Studio'
          },
          {
            hari: 'Minggu',
            waktu: '14:00',
            lokasi: 'Online - Figma'
          }
        ]
      },
      {
        nama: 'Competitive Programming',
        deskripsi: 'Persiapan untuk lomba programming: ICPC, Gemastik, dan kompetisi lainnya',
        kategori: 'competition',
        anggota: users.filter(u => u.role === 'student').map(u => u._id),
        admin: users.find(u => u.nama === 'John Doe')?._id || users[1]._id,
        isPublic: true,
        documents: documents.filter(doc => doc.kategori === 'materi'),
        maksAnggota: 50,
        jadwalPertemuan: [
          {
            hari: 'Senin',
            waktu: '20:00',
            lokasi: 'Online - HackerRank'
          },
          {
            hari: 'Rabu',
            waktu: '20:00',
            lokasi: 'Online - Codeforces'
          },
          {
            hari: 'Sabtu',
            waktu: '09:00',
            lokasi: 'Lab Programming'
          }
        ]
      },
      {
        nama: 'Data Analytics with Python',
        deskripsi: 'Belajar analisis data menggunakan Python, pandas, numpy, dan visualization',
        kategori: 'data-science',
        anggota: [users[2]._id, users[3]._id, users[4]._id],
        admin: users[2]._id,
        isPublic: true,
        documents: [],
        maksAnggota: 25,
        jadwalPertemuan: [
          {
            hari: 'Kamis',
            waktu: '17:00',
            lokasi: 'Data Science Lab'
          }
        ]
      },
      {
        nama: 'Cloud Computing Study Group',
        deskripsi: 'AWS, Google Cloud, Azure - Learn cloud technologies together',
        kategori: 'cloud',
        anggota: users.slice(1, 4).map(u => u._id),
        admin: users[1]._id,
        isPublic: true,
        documents: [],
        maksAnggota: 30,
        jadwalPertemuan: [
          {
            hari: 'Selasa',
            waktu: '19:30',
            lokasi: 'Online - AWS Workshop'
          },
          {
            hari: 'Minggu',
            waktu: '10:00',
            lokasi: 'Online - Study Session'
          }
        ]
      },
      {
        nama: 'Blockchain & Web3 Developers',
        deskripsi: 'Exploring blockchain technology, smart contracts, and decentralized applications',
        kategori: 'blockchain',
        anggota: [users[0]._id, users[3]._id, users[4]._id],
        admin: users[0]._id,
        isPublic: true,
        documents: [],
        maksAnggota: 20,
        jadwalPertemuan: [
          {
            hari: 'Jumat',
            waktu: '20:00',
            lokasi: 'Online - Web3 Lab'
          }
        ]
      }
    ]);

    console.log(`\n✅ Successfully created ${studyGroups.length} study groups!`);
    
    // Display summary
    console.log('\nStudy Groups Summary:');
    for (const group of studyGroups) {
      console.log(`- ${group.nama}: ${group.anggota.length} members, ${group.documents.length} documents`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding study groups:', error);
    process.exit(1);
  }
};

seedStudyGroups();