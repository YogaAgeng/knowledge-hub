import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Document from '../models/Document.js';
import StudyGroup from '../models/StudyGroup.js';
import Discussion from '../models/Discussion.js';
import Comment from '../models/Comment.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/knowledge_hub');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Document.deleteMany({});
    await StudyGroup.deleteMany({});
    await Discussion.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const password = await bcrypt.hash('password123', 10);
    
    const users = await User.create([
      {
        email: 'admin@university.ac.id',
        password,
        nama: 'Admin User',
        nim: '0000000000',
        jurusan: 'Sistem Informasi',
        semester: 8,
        role: 'admin'
      },
      {
        email: 'john@student.ac.id',
        password,
        nama: 'John Doe',
        nim: '2021001001',
        jurusan: 'Teknik Informatika',
        semester: 5,
        role: 'student'
      },
      {
        email: 'jane@student.ac.id',
        password,
        nama: 'Jane Smith',
        nim: '2021002002',
        jurusan: 'Sistem Informasi',
        semester: 4,
        role: 'student'
      },
      {
        email: 'alice@student.ac.id',
        password,
        nama: 'Alice Johnson',
        nim: '2022003003',
        jurusan: 'Teknik Informatika',
        semester: 3,
        role: 'student'
      },
      {
        email: 'bob@student.ac.id',
        password,
        nama: 'Bob Wilson',
        nim: '2022004004',
        jurusan: 'Ilmu Komputer',
        semester: 3,
        role: 'student'
      }
    ]);
    console.log('Created users');

    // Create documents
    const documents = await Document.create([
      {
        judul: 'Dasar-Dasar Pemrograman Python',
        deskripsi: 'Panduan lengkap untuk pemula dalam mempelajari Python',
        kategori: 'catatan',
        mataKuliah: 'Pemrograman Dasar',
        tags: ['python', 'programming', 'beginner'],
        konten: '# Dasar-Dasar Python\n\n## Pendahuluan\nPython adalah bahasa pemrograman yang mudah dipelajari...\n\n## Variabel\nVariabel dalam Python tidak perlu dideklarasikan...',
        penulis: users[1]._id,
        akses: 'public',
        format: 'markdown',
        ukuranFile: 15360,
        jumlahHalaman: 12
      },
      {
        judul: 'Struktur Data dan Algoritma',
        deskripsi: 'Materi kuliah struktur data semester 3',
        kategori: 'materi',
        mataKuliah: 'Struktur Data',
        tags: ['data-structure', 'algorithm', 'computer-science'],
        konten: '# Struktur Data\n\n## Array\nArray adalah struktur data linear...\n\n## Linked List\nLinked list adalah struktur data dinamis...',
        penulis: users[2]._id,
        akses: 'public',
        format: 'markdown',
        ukuranFile: 25600,
        jumlahHalaman: 20
      },
      {
        judul: 'Database Management System',
        deskripsi: 'Rangkuman materi DBMS untuk UTS',
        kategori: 'rangkuman',
        mataKuliah: 'Basis Data',
        tags: ['database', 'sql', 'dbms'],
        konten: '# DBMS Summary\n\n## Relational Database\nDatabase relasional menggunakan tabel...\n\n## SQL Commands\n- SELECT\n- INSERT\n- UPDATE\n- DELETE',
        penulis: users[3]._id,
        akses: 'restricted',
        aksesUsers: [users[1]._id, users[2]._id],
        format: 'markdown',
        ukuranFile: 18432,
        jumlahHalaman: 15
      },
      {
        judul: 'Machine Learning Basics',
        deskripsi: 'Introduction to ML concepts and algorithms',
        kategori: 'artikel',
        mataKuliah: 'Artificial Intelligence',
        tags: ['machine-learning', 'ai', 'data-science'],
        konten: '# Machine Learning\n\n## Supervised Learning\nSupervised learning uses labeled data...\n\n## Unsupervised Learning\nUnsupervised learning finds patterns...',
        penulis: users[1]._id,
        akses: 'public',
        format: 'markdown',
        ukuranFile: 30720,
        jumlahHalaman: 25
      },
      {
        judul: 'Web Development dengan React',
        deskripsi: 'Tutorial lengkap React.js untuk pemula',
        kategori: 'tutorial',
        mataKuliah: 'Pemrograman Web',
        tags: ['react', 'javascript', 'frontend'],
        konten: '# React.js Tutorial\n\n## Components\nKomponen adalah building blocks...\n\n## State Management\nState adalah data yang berubah...',
        penulis: users[2]._id,
        akses: 'public',
        format: 'markdown',
        ukuranFile: 22528,
        jumlahHalaman: 18
      }
    ]);
    console.log('Created documents');

    // Create study groups
    const studyGroups = await StudyGroup.create([
      {
        nama: 'Python Programming Club',
        deskripsi: 'Kelompok belajar untuk Python enthusiasts',
        kategori: 'programming',
        anggota: [users[1]._id, users[2]._id, users[3]._id],
        admin: users[1]._id,
        isPublic: true,
        documents: [documents[0]._id],
        maksAnggota: 20
      },
      {
        nama: 'Data Science Study Group',
        deskripsi: 'Belajar bersama tentang data science dan machine learning',
        kategori: 'data-science',
        anggota: [users[1]._id, users[3]._id, users[4]._id],
        admin: users[3]._id,
        isPublic: true,
        documents: [documents[3]._id],
        maksAnggota: 15
      },
      {
        nama: 'Web Dev Warriors',
        deskripsi: 'Kelompok belajar web development',
        kategori: 'web-development',
        anggota: [users[2]._id, users[4]._id],
        admin: users[2]._id,
        isPublic: false,
        documents: [documents[4]._id],
        maksAnggota: 10
      }
    ]);
    console.log('Created study groups');

    // Create discussions
    const discussions = await Discussion.create([
      {
        dokumenId: documents[0]._id,
        userId: users[2]._id,
        konten: 'Great introduction to Python! Very helpful for beginners.',
        tipe: 'comment',
        posisi: { halaman: 1, x: 100, y: 200 }
      },
      {
        dokumenId: documents[0]._id,
        userId: users[3]._id,
        konten: 'Could you add more examples on loops?',
        tipe: 'question',
        posisi: { halaman: 3, x: 150, y: 300 }
      },
      {
        dokumenId: documents[1]._id,
        userId: users[1]._id,
        konten: 'The linked list explanation is excellent!',
        tipe: 'comment',
        posisi: { halaman: 5, x: 200, y: 150 }
      }
    ]);
    console.log('Created discussions');

    // Create comments (replies to discussions)
    const comments = await Comment.create([
      {
        discussionId: discussions[1]._id,
        userId: users[1]._id,
        konten: 'Sure! I\'ll add more loop examples in the next update.'
      },
      {
        discussionId: discussions[1]._id,
        userId: users[2]._id,
        konten: 'That would be great! Especially nested loops.'
      }
    ]);
    console.log('Created comments');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('Admin: admin@university.ac.id / password123');
    console.log('Students: john@student.ac.id, jane@student.ac.id, alice@student.ac.id, bob@student.ac.id');
    console.log('Password for all: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();