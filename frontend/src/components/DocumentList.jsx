/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { getData,deleteData } from '../api/apiService';

function DocumentList() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await getData("/documents")
        setDocuments(data);
      } catch (error) {
        // Tangani error
        console.error("Gagal mengambil dokumen:", error);
      }
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteData(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error("Gagal menghapus dokumen:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Daftar Dokumen</h2>
      
      {documents.length === 0 ? (
        <div className="text-center text-gray-500">
          Belum ada dokumen. Silakan buat dokumen baru.
        </div>
      ) : (
        documents.map(doc => (
          <div 
            key={doc.id} 
            className="border-b py-4 hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{doc.title}</h3>
                <p className="text-sm text-gray-500">{doc.type || 'Tipe Tidak Diketahui'}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                >
                  Lihat
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>
            </div>
            <p className="text-gray-600 mt-2 line-clamp-2">{doc.content}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default DocumentList;