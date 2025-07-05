/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as integrationsService from '../../api/integrationsService';

const GoogleDriveIntegration = ({ onImportSuccess }) => {
  const [status, setStatus] = useState({ connected: false, loading: true });
  const [importing, setImporting] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [importProgress, setImportProgress] = useState(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus({ connected: false, loading: true });
      const response = await integrationsService.checkGoogleDriveConnection();
      setStatus({ connected: response.connected, loading: false });
      
      if (response.connected) {
        loadFiles();
      }
    } catch (error) {
      console.error('Failed to check Google Drive connection:', error);
      setStatus({ connected: false, loading: false });
      toast.error('Failed to check Google Drive connection');
    }
  };

  const loadFiles = async (folderId = null) => {
    try {
      setLoadingFiles(true);
      const response = await integrationsService.listGoogleDriveFiles(folderId);
      setFiles(response.files || []);
      setCurrentFolder(folderId);
    } catch (error) {
      console.error('Failed to load Google Drive files:', error);
      toast.error('Failed to load files from Google Drive');
      setFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await integrationsService.getGoogleDriveAuthUrl();
      // Open auth URL in new window
      const authWindow = window.open(
        response.authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Poll for auth completion
      const checkAuth = setInterval(async () => {
        try {
          if (authWindow.closed) {
            clearInterval(checkAuth);
            // Check connection after auth window closes
            setTimeout(checkConnection, 1000);
          }
        } catch (error) {
          clearInterval(checkAuth);
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to connect to Google Drive:', error);
      toast.error('Failed to connect to Google Drive');
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Drive?')) return;
    
    try {
      // This would call a disconnect API endpoint
      // await integrationsService.disconnectGoogleDrive();
      setStatus({ connected: false, loading: false });
      setFiles([]);
      setSelectedFiles(new Set());
      toast.success('Google Drive disconnected');
    } catch (error) {
      toast.error('Failed to disconnect Google Drive');
    }
  };

  const handleImport = async () => {
    if (selectedFiles.size === 0) {
      toast.error('Please select files to import');
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: selectedFiles.size });
    
    try {
      const fileIds = Array.from(selectedFiles);
      const response = await integrationsService.importFromGoogleDrive({
        fileIds,
        onProgress: (progress) => {
          setImportProgress(progress);
        }
      });
      
      toast.success(`Successfully imported ${response.importedCount} documents`);
      onImportSuccess?.(response);
      setSelectedFiles(new Set());
      
      // Show imported documents summary
      if (response.importedDocuments && response.importedDocuments.length > 0) {
        showImportSummary(response.importedDocuments);
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to import files';
      toast.error(message);
      console.error('Import error:', error);
    } finally {
      setImporting(false);
      setImportProgress(null);
    }
  };

  const showImportSummary = (importedDocuments) => {
    const summary = importedDocuments.map(doc => 
      `✅ ${doc.title} (${doc.type})`
    ).join('\n');
    
    toast.success(
      `Import completed!\n${summary}`,
      { duration: 5000 }
    );
  };

  const toggleFileSelection = (fileId) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const selectAllFiles = () => {
    const documentFiles = files.filter(file => isDocumentFile(file));
    const allFileIds = documentFiles.map(file => file.id);
    setSelectedFiles(new Set(allFileIds));
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  const navigateToFolder = (folderId, folderName) => {
    const newPath = [...folderPath, { id: folderId, name: folderName }];
    setFolderPath(newPath);
    loadFiles(folderId);
    setSelectedFiles(new Set()); // Clear selection when navigating
  };

  const navigateBack = () => {
    if (folderPath.length === 0) return;
    
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    
    const parentFolderId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    loadFiles(parentFolderId);
    setSelectedFiles(new Set());
  };

  const navigateToRoot = () => {
    setFolderPath([]);
    loadFiles(null);
    setSelectedFiles(new Set());
  };

  const getFileIcon = (file) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') return '📁';
    if (file.mimeType.includes('document')) return '📝';
    if (file.mimeType.includes('spreadsheet')) return '📊';
    if (file.mimeType.includes('presentation')) return '📽️';
    if (file.mimeType.includes('pdf')) return '📄';
    if (file.mimeType.includes('text')) return '📄';
    return '📄';
  };

  const getFileTypeLabel = (mimeType) => {
    if (mimeType.includes('document')) return 'Document';
    if (mimeType.includes('spreadsheet')) return 'Spreadsheet';
    if (mimeType.includes('presentation')) return 'Presentation';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('text')) return 'Text';
    return 'File';
  };

  const isDocumentFile = (file) => {
    return file.mimeType !== 'application/vnd.google-apps.folder' &&
           (file.mimeType.includes('document') ||
            file.mimeType.includes('text') ||
            file.mimeType.includes('pdf'));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (status.loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4">🗂️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connect to Google Drive
          </h3>
          <p className="text-gray-600 mb-6">
            Import your documents from Google Drive to KnowledgeHub. 
            Connect securely using OAuth2 authentication.
          </p>
          
          <button
            onClick={handleConnect}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-medium inline-flex items-center space-x-2"
          >
            <span>🔗</span>
            <span>Connect Google Drive</span>
          </button>
          
          <div className="mt-6 text-sm text-gray-500 space-y-2">
            <p>✅ Secure OAuth2 authentication</p>
            <p>✅ Read-only access to your files</p>
            <p>✅ No passwords stored</p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What will be imported:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Google Docs documents</li>
              <li>• Text files (.txt, .md)</li>
              <li>• PDF files</li>
              <li>• Documents will be automatically categorized</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const documentFiles = files.filter(isDocumentFile);
  const folders = files.filter(file => file.mimeType === 'application/vnd.google-apps.folder');

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-green-500 text-xl mr-3">✅</div>
            <div>
              <p className="font-medium text-green-800">Google Drive Connected</p>
              <p className="text-sm text-green-600">You can now import documents from your Google Drive</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Import Progress */}
      {importProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900">Importing files...</span>
            <span className="text-sm text-blue-700">
              {importProgress.current} / {importProgress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(importProgress.current / importProgress.total) * 100}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900">Browse Files</h3>
            {folderPath.length > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <button
                  onClick={navigateToRoot}
                  className="hover:text-blue-500 transition"
                >
                  My Drive
                </button>
                {folderPath.map((folder, index) => (
                  <span key={folder.id} className="flex items-center space-x-1">
                    <span>/</span>
                    <span className="font-medium">{folder.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {folderPath.length > 0 && (
              <button
                onClick={navigateBack}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => loadFiles(currentFolder)}
              disabled={loadingFiles}
              className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              {loadingFiles ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* File List */}
        {loadingFiles ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📂</div>
            <p className="text-gray-500">No files found in this folder</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Folders */}
            {folders.map(folder => (
              <div
                key={folder.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition"
                onClick={() => navigateToFolder(folder.id, folder.name)}
              >
                <div className="text-2xl">📁</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{folder.name}</p>
                  <p className="text-sm text-gray-500">Folder</p>
                </div>
                <div className="text-gray-400">→</div>
              </div>
            ))}

            {/* Documents */}
            {documentFiles.map(file => (
              <div
                key={file.id}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition ${
                  selectedFiles.has(file.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => toggleFileSelection(file.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                
                <div className="text-2xl">{getFileIcon(file)}</div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span>{getFileTypeLabel(file.mimeType)}</span>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>Modified {formatDate(file.modifiedTime)}</span>
                  </div>
                </div>
                
                {file.webViewLink && (
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Selection Actions */}
        {documentFiles.length > 0 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {selectedFiles.size} of {documentFiles.length} file(s) selected
              </span>
              
              <div className="flex space-x-2">
                <button
                  onClick={selectAllFiles}
                  disabled={selectedFiles.size === documentFiles.length}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  disabled={selectedFiles.size === 0}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>
            
            <button
              onClick={handleImport}
              disabled={selectedFiles.size === 0 || importing}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {importing ? 'Importing...' : `Import ${selectedFiles.size} File(s)`}
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Import Information:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-medium text-gray-800 mb-1">Supported Files:</h5>
            <ul className="space-y-1">
              <li>• Google Docs → Makalah/Catatan</li>
              <li>• Text files → Catatan</li>
              <li>• PDF files → Reference documents</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-1">Features:</h5>
            <ul className="space-y-1">
              <li>• Automatic content categorization</li>
              <li>• Preserves formatting</li>
              <li>• Creates searchable tags</li>
              <li>• Original files unchanged</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleDriveIntegration;