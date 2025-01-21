// src/pages/DocumentsPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, deleteDocument } from '../api/apiService';
import DocumentList from '../components/DocumentList';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getDocuments();
        setDocuments(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (id) => {
    navigate(`/document/edit/${id}`);
  };

  if (loading) return <div>Memuat dokumen...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Dokumen</h1>
        <Link 
          to="/document/new" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Tambah Dokumen
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center text-gray-500">
          Belum ada dokumen. Silakan buat dokumen baru.
        </div>
      ) : (
        <DocumentList 
          documents={documents} 
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}

export default DocumentsPage;