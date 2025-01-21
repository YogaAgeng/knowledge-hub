import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Navbar() {
    const navigate = useNavigate();
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          KnowledgeHub
        </Link>
        
        <div className="space-x-4">
          <Link 
            to="/dashboard" 
            onClick={() => navigate("/login")}
            className="text-gray-700 hover:text-blue-600 transition"
          >
            Dashboard
          </Link>
          <Link 
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;