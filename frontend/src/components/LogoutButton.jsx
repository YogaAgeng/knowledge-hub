import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { logout } from '../api/apiService';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Berhasil logout');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Gagal melakukan logout');
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;