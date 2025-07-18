import { Outlet, Navigate } from 'react-router-dom';
import AuthNavbar from './AuthNavbar';

function AuthLayout() {
    // Periksa token di localStorage
    const token = localStorage.getItem('token');
    
    // Jika tidak ada token, redirect ke login
    if (!token) {
      return <Navigate to="/login" replace />;
    }


  return (
    <div>
            <AuthNavbar />
            <div className="p-4">
                <Outlet />
            </div>
        </div>
  );
}
export default AuthLayout;