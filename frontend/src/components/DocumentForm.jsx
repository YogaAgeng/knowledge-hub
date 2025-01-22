/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createDocument, getDocumentById, updateDocument } from '../api/apiService';

// import { createDocument } from '../services/documentService';


function DocumentForm() {
  const [document, setDocument] = useState({
    title: '',
    content: '',
    type: '',
    tags: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const fetchDocument = async () => {
        try {
          const data = await getDocumentById(id);
          setDocument({
            ...data,
            tags: data.tags.join(', ')
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDocument();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocument(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi tambahan
    if (!document.title.trim()) {
      setError('Judul dokumen tidak boleh kosong');
      setLoading(false);
      return;
    }

    if (!document.content.trim()) {
      setError('Konten dokumen tidak boleh kosong');
      setLoading(false);
      return;
    }

    if (!document.type) {
      setError('Pilih tipe dokumen');
      setLoading(false);
      return;
    }

    try {
      const documentData = {
        ...document,
        tags: document.tags ? document.tags.split(',').map(tag => tag.trim()) : []
      };

      if (isEditMode) {
        await updateDocument(id, documentData);
      } else {
        await createDocument(documentData);
      }

      navigate('/documents');
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan dokumen');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center mt-10">Memuat dokumen...</div>;
  }


  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? 'Edit Dokumen' : 'Buat Dokumen Baru'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Judul Dokumen</label>
          <input
            type="text"
            name="title"
            value={document.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Tipe Dokumen</label>
          <select
            name="type"
            value={document.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Pilih Tipe Dokumen</option>
            <option value="tugas">Tugas</option>
            <option value="makalah">Makalah</option>
            <option value="catatan">Catatan Kuliah</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Konten Dokumen</label>
          <textarea
            name="content"
            value={document.content}
            onChange={handleChange}
            rows={10}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Tags (pisahkan dengan koma)</label>
          <input
            type="text"
            name="tags"
            value={document.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="contoh: akademik, matematika"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-white ${
              loading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Menyimpan...' : 'Simpan Dokumen'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default DocumentForm;