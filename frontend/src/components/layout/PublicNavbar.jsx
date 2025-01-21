import { Link } from 'react-router-dom';

function PublicNavbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          KnowledgeHub
        </Link>
        
      </div>
    </nav>
  );
}

export default PublicNavbar;