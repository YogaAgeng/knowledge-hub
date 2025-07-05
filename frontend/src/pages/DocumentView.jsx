/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getDocumentById, updateDocument, getDocumentVersions } from '../api/apiService';
import CollaborationPanel from '../components/collaboration/CollaborationPanel';

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('document');

  useEffect(() => {
    if (id) {
      fetchDocument();
      fetchVersions();
    }
  }, [id]);

  const fetchDocument = async () => {
  try {
    setLoading(true);
    // Log the ID being fetched
    console.log('Fetching document ID:', id);
    const doc = await getDocumentById(id);
    if (!doc) {
      throw new Error('Document not found');
    }
    setDocument(doc);
    setEditedContent(doc.content);
  } catch (error) {
    console.error('Failed to fetch document:', error);
    toast.error(
      error.message === 'Document not found' 
        ? 'Document not found or has been deleted'
        : 'Failed to load document'
    );
    // Add a small delay before navigation
    setTimeout(() => navigate('/documents'), 2000);
  }
};

  const fetchVersions = async () => {
    try {
      const response = await getDocumentVersions(id);
      setVersions(response.data || []);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    }
  };

  const handleSave = async () => {
    if (editedContent.trim() === document.content) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      await updateDocument(id, {
        ...document,
        content: editedContent.trim()
      });
      
      setDocument(prev => ({ ...prev, content: editedContent.trim() }));
      setIsEditing(false);
      toast.success('Document updated successfully');
      fetchVersions(); // Refresh versions after update
    } catch (error) {
      console.error('Failed to save document:', error);
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(document.content);
    setIsEditing(false);
  };

  const canEdit = document?.userRole === 'owner' || document?.userRole === 'editor';
  const canComment = ['owner', 'editor', 'commenter'].includes(document?.userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Document not found</h2>
          <p className="text-gray-600 mb-4">The document you're looking for doesn't exist or you don't have access to it.</p>
          <Link
            to="/documents"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/documents"
                className="text-gray-500 hover:text-gray-700 transition"
              >
                ← Back to Documents
              </Link>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">
                    Type: <span className="capitalize font-medium">{document.type}</span>
                  </span>
                  <span className="text-sm text-gray-500">
                    Role: <span className="capitalize font-medium text-blue-600">{document.userRole}</span>
                  </span>
                  {document.tags && document.tags.length > 0 && (
                    <div className="flex space-x-1">
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
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Edit Document
                </button>
              )}
              
              {isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || editedContent.trim() === document.content}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('document')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'document'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Document
                  </button>
                  <button
                    onClick={() => setActiveTab('versions')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'versions'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Versions ({versions.length})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'document' && (
                  <div>
                    {isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document Content
                        </label>
                        <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full h-96 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
                          placeholder="Enter document content..."
                        />
                        <div className="mt-2 text-xs text-gray-500">
                          {editedContent.length} characters
                        </div>
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <div className="bg-gray-50 rounded-lg p-6 border">
                          <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                            {document.content}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'versions' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Document Versions
                    </h3>
                    {versions.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-2">📝</div>
                        <p className="text-gray-500">No versions available</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {versions.map((version, index) => (
                          <VersionItem
                            key={version._id}
                            version={version}
                            isLatest={index === 0}
                            document={document}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Collaboration Panel */}
          <div className="xl:col-span-1">
            <CollaborationPanel 
              document={document} 
              onDocumentUpdate={fetchDocument}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Version Item Component
const VersionItem = ({ version, isLatest, document }) => {
  const [showContent, setShowContent] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                Version {version.versionNumber}
              </span>
              {isLatest && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  Current
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowContent(!showContent)}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            {showContent ? 'Hide' : 'View'} Content
          </button>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          <p>Created by <span className="font-medium">{version.createdBy?.nama}</span></p>
          <p>{formatDate(version.createdAt)}</p>
          {version.description && (
            <p className="italic">"{version.description}"</p>
          )}
        </div>
      </div>
      
      {showContent && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 max-h-48 overflow-y-auto">
            {version.content}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DocumentView;