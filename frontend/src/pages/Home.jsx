import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center">
                            <Link
                                to="/"
                                className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition"
                            >
                                KnowledgeHub
                            </Link>
                        </div>

                        <div className="flex space-x-6">
                            <Link
                                to="/login"
                                className="text-xl text-gray-800 hover:text-blue-600 transition px-4 py-2 rounded-lg hover:bg-gray-100"
                            >
                                Masuk
                            </Link>
                            <Link
                                to="/register"
                                className="text-xl bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                            >
                                Daftar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-20 flex-grow flex items-center justify-center w-full px-4 py-16 bg-gradient-to-br from-blue-50 to-white">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                        Kelola Pengetahuanmu dengan Mudah
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Platform manajemen pengetahuan untuk mahasiswa yang membantu Anda
                        mengorganisir, menyinkronkan, dan mengembangkan materi akademik
                    </p>

                    <div className="flex justify-center space-x-4">
                        <Link
                            to="/register"
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                            Mulai Sekarang
                        </Link>
                        <a
                            href="#fitur"
                            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-xl hover:bg-gray-300 transition transform hover:scale-105"
                        >
                            Pelajari Lebih Lanjut
                        </a>
                    </div>
                </div>
            </main>

            {/* Statistik Pencapaian */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: '10K+', label: 'Mahasiswa Aktif' },
                            { number: '500+', label: 'Dokumen Tersinkronkan' },
                            { number: '50+', label: 'Perguruan Tinggi' },
                            { number: '24/7', label: 'Dukungan' }
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 p-6 rounded-xl hover:shadow-lg transition"
                            >
                                <h3 className="text-4xl font-bold text-blue-600 mb-2">
                                    {stat.number}
                                </h3>
                                <p className="text-gray-600">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fitur Utama */}
            <section id="fitur" className="w-full py-16 bg-gray-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                        Fitur Utama
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                title: "Manajemen Dokumen",
                                description: "Buat, edit, dan organisir dokumen akademikmu dengan mudah",
                                icon: "📄"
                            },
                            {
                                title: "Sinkronisasi Platform",
                                description: "Sambungkan berbagai platform akademik dalam satu tempat",
                                icon: "🔗"
                            },
                            {
                                title: "Pencarian Cerdas",
                                description: "Temukan dokumen dengan cepat menggunakan pencarian canggih",
                                icon: "🔍"
                            },
                            {
                                title: "Bookmark",
                                description: "Temukan dokumen dengan cepat menggunakan pencarian canggih",
                                icon: "🔍"
                            }
                        ].map((fitur, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-blue-500"
                            >
                                <div className="text-4xl mb-4">{fitur.icon}</div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                                    {fitur.title}
                                </h3>
                                <p className="text-gray-600">
                                    {fitur.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimoni */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                        Apa Kata Mahasiswa
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Muhammad Rizki',
                                major: 'Teknik Informatika',
                                quote: 'KnowledgeHub mengubah cara saya mengelola materi kuliah. Sangat membantu!',
                                avatar: '/avatar1.jpg'
                            },
                            {
                                name: 'Siti Aminah',
                                major: 'Sistem Informasi',
                                quote: 'Fitur sinkronisasi platformnya luar biasa. Semua dokumen jadi terorganir.',
                                avatar: '/avatar2.jpg'
                            },
                            {
                                name: 'Ahmad Fauzi',
                                major: 'Ilmu Komputer',
                                quote: 'Pencarian cerdas memudahkan saya menemukan referensi dengan cepat.',
                                avatar: '/avatar3.jpg'
                            }
                        ].map((testimoni, index) => (
                            <div
                                key={index}
                                className="bg-gray-100 p-6 rounded-xl shadow-md hover:shadow-lg transition"
                            >
                                <p className="italic text-gray-700 mb-4"> &quot;{testimoni.quote} &quot;</p>
                                <div className="flex items-center">
                                    <img
                                        src={testimoni.avatar}
                                        alt={testimoni.name}
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{testimoni.name}</h4>
                                        <p className="text-gray-600 text-sm">{testimoni.major}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-blue-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Mulai Perjalanan Akademikmu Sekarang
                    </h2>
                    <p className="text-xl mb-8">
                        Bergabunglah ribuan mahasiswa yang sudah mengoptimalkan potensi akademik
                    </p>
                    <Link
                        to="/register"
                        className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Daftar Gratis
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-gray-800 text-white py-8">
                <div className="container mx-auto text-center">
                    <p className="text-gray-300">
                        © {new Date().getFullYear()} KnowledgeHub. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Home;