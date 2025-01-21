import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    konfirmasiPassword: '',
    jurusan: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi password
    if (formData.password !== formData.konfirmasiPassword) {
      alert('Password tidak cocok');
      return;
    }

    // Logika registrasi akan ditambahkan
    console.log('Data Registrasi:', formData);
    
    // Sementara navigasi ke dashboard
    navigate('/dashboard');
  };

  // Daftar jurusan
  const jurusanList = [
    'Teknik Informatika',
    'Sistem Informasi',
    'Ilmu Komputer',
    'Teknik Elektro',
    'Teknik Mesin',
    'Manajemen',
    'Akuntansi',
    'Lainnya'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Daftar
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Lengkap */}
          <div>
            <label 
              htmlFor="nama" 
              className="block text-gray-700 mb-2"
            >
              Nama Lengkap
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Masukkan nama lengkap"
            />
          </div>

          {/* Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="contoh@email.com"
            />
          </div>

          {/* Jurusan */}
          <div>
            <label 
              htmlFor="jurusan" 
              className="block text-gray-700 mb-2"
            >
              Jurusan
            </label>
            <select
              id="jurusan"
              name="jurusan"
              value={formData.jurusan}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Jurusan</option>
              {jurusanList.map((jurusan, index) => (
                <option key={index} value={jurusan}>
                  {jurusan}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label 
              htmlFor="password" 
              className="block text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Minimal 8 karakter"
              minLength={8}
            />
          </div>

          {/* Konfirmasi Password */}
          <div>
            <label 
              htmlFor="konfirmasiPassword" 
              className="block text-gray-700 mb-2"
            >
              Konfirmasi Password
            </label>
            <input
              type="password"
              id="konfirmasiPassword"
              name="konfirmasiPassword"
              value={formData.konfirmasiPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="Ulangi password"
              minLength={8}
            />
          </div>

          {/* Tombol Daftar */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Daftar
          </button>
        </form>

        {/* Link Login */}
        <p className="text-center mt-4 text-gray-600">
          Sudah punya akun?{' '}
          <a 
            href="/login" 
            className="text-blue-500 hover:underline"
          >
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;