
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link } from 'react-router-dom';                                    // ✅ NEW IMPORT
// import { getDocuments, deleteDocument } from '../api/apiService';

const DocumentList = ({ documents }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      if (filter === 'all') return true;
      return doc.type === filter;
    })
    .filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case 'oldest':
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });




  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Tipe</option>
              <option value="tugas">Tugas</option>
              <option value="makalah">Makalah</option>
              <option value="catatan">Catatan</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="recent">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-600">
        Menampilkan {filteredAndSortedDocuments.length} dari {documents.length} dokumen
      </div>

      {/* Documents Grid */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Tidak ada dokumen yang cocok' : 'Belum ada dokumen'}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Coba ubah kata kunci pencarian' : 'Mulai dengan membuat dokumen pertama Anda'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedDocuments.map(document => (
            <DocumentCard key={document._id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
};

// Document Card Component
const DocumentCard = ({ document }) => {
  const getDocumentIcon = (type) => {
    switch (type) {
      case 'tugas': return '📝';
      case 'makalah': return '📄';
      case 'catatan': return '📋';
      default: return '📄';
    }
  };

  const getDocumentTypeBadge = (type) => {
    const badges = {
      tugas: 'bg-orange-100 text-orange-800',
      makalah: 'bg-green-100 text-green-800',
      catatan: 'bg-blue-100 text-blue-800'
    };
    return badges[type] || badges.catatan;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Link
      to={`/documents/${document._id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl group-hover:scale-110 transition-transform">
            {getDocumentIcon(document.type)}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeBadge(document.type)}`}>
            {document.type}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {document.title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {document.content.substring(0, 150)}...
        </p>

        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {document.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {document.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{document.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Diperbarui {formatDate(document.updatedAt)}</span>
          <div className="flex items-center space-x-3">
            {document.isShared && (
              <span className="flex items-center space-x-1">
                <span>🤝</span>
                <span>{document.stats?.collaborators || 0}</span>
              </span>
            )}
            {document.stats?.comments > 0 && (
              <span className="flex items-center space-x-1">
                <span>💬</span>
                <span>{document.stats.comments}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DocumentList;