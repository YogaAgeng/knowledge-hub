/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getData } from '../api/apiService';
// import DocumentList from '../components/DocumentList';

function Dashboard() {

  const [stats, setStats] = useState({
    totalDocuments: 0,
    monthlyDocuments: 0,
    usedStorage: 0
  });
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Token:', localStorage.getItem('token')); // Debug token
        console.log('Fetching dashboard stats');
        
        const statsResponse = await getData('/dashboard/stats');
        console.log('Stats Response:', statsResponse);
        setStats(statsResponse);

        console.log('Fetching recent documents');
        const documentsResponse = await getData('/dashboard/documents');
        console.log('Documents Response:', documentsResponse);
        setRecentDocuments(documentsResponse);

        setLoading(false);
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
        console.error('Error Details:', {
          message: error.message,
          response: error.response,
          request: error.request
        });
        
        setError(error.message || 'Gagal mengambil data dashboard');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Hanya dijalankan sekali saat komponen pertama kali dirender

  if (loading) return <div>Memuat dashboard...</div>;

  if (error) return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Total Dokumen</h3>
            <p className="text-4xl font-bold text-blue-600">{stats.totalDocuments}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Dokumen Bulan Ini</h3>
            <p className="text-4xl font-bold text-green-600">{stats.monthlyDocuments}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-4">Ruang Tersimpan</h3>
            <p className="text-4xl font-bold text-purple-600">{stats.usedStorage} MB</p>
          </div>
        </div>

        {/* Dokumen Terbaru */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Dokumen Terbaru</h2>
            <Link 
              to="/documents" 
              className="text-blue-600 hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          
          {recentDocuments.length === 0 ? (
            <p className="text-gray-500">Belum ada dokumen</p>
          ) : (
            <div>
              {recentDocuments.map(doc => (
                <div 
                  key={doc._id} 
                  className="border-b py-4 last:border-b-0"
                >
                  <h3 className="text-lg font-semibold">{doc.title}</h3>
                  <p className="text-gray-600">{doc.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default Dashboard;