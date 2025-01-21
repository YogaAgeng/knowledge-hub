import { Link, useNavigate } from 'react-router-dom';
// import { logout } from '../../api/apiService';

function AuthNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Panggil API logout
      
      // Hapus token dari localStorage
      localStorage.removeItem('token');
      
      // Redirect ke halaman login
      navigate('/login');
    } catch (error) {
      console.error('Logout gagal', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
          KnowledgeHub
        </Link>
        
        <div className="space-x-4">
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AuthNavbar;