import { Link } from 'react-router-dom';
import LogoutButton from '../LogoutButton';

function AuthNavbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
          KnowledgeHub
        </Link>
        
        <div className="space-x-4">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

export default AuthNavbar;