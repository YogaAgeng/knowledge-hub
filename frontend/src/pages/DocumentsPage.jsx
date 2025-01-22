// src/pages/DocumentsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, deleteDocument } from '../api/apiService';
import DocumentList from '../components/DocumentList';
import DocumentForm from '../components/DocumentForm';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Daftar Dokumen</h1>
        <button 
          onClick={openModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Tambah Dokumen
        </button>
      </div>

      {/* Modal Formulir Dokumen */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <DocumentForm 
              onClose={closeModal} 
              onDocumentCreated={(newDocument) => {
                setDocuments(prev => [newDocument, ...prev]);
                closeModal();
              }}
            />
          </div>
        </div>
      )}

      {/* Existing document list rendering */}
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