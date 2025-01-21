/* eslint-disable react/prop-types */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentsPage from './pages/DocumentsPage';
import DocumentForm from './components/DocumentForm';
import PublicLayout from './components/layout/PublicLayout';
import AuthLayout from './components/layout/AuthLayout';

// Komponen untuk route yang memerlukan autentikasi
/* eslint-disable no-unused-vars */

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Rute Terautentikasi */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          {/* Rute dashboard */}
          <Route index element={<Dashboard />} />
        </Route>

        {/* Rute Dokumen */}
        <Route 
          path="/documents" 
          element={
            <ProtectedRoute>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          {/* Daftar dokumen */}
          <Route index element={<DocumentsPage />} />
          
          {/* Formulir dokumen baru */}
          <Route path="new" element={<DocumentForm />} />
          
          {/* Edit dokumen */}
          <Route path="edit/:id" element={<DocumentForm />} />
        </Route>

        {/* Tangani rute yang tidak ditemukan */}
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;