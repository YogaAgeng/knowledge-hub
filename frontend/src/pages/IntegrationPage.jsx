/* eslint-disable no-unused-vars */


import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import GoogleDriveIntegration from '../components/integrations/GoogleDriveIntegration';
import NotionIntegration from '../components/integrations/NotionIntegration';      // ✅ NEW IMPORT
import OneNoteIntegration from '../components/integrations/OneNoteIntegration';

const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState('google-drive');
  const navigate = useNavigate();
  const handleImportSuccess = (data) => {
    if (data?.importedCount) {
      toast.success(`Successfully imported ${data.importedCount} documents!`);
    } else {
      toast.success('Import completed successfully!');
    }
    console.log('Import success data:', data);
  };

  const tabs = [
    { id: 'google-drive', name: 'Google Drive', icon: '🗂️', available: true },
    { id: 'notion', name: 'Notion', icon: '📝', available: true },
    { id: 'onenote', name: 'OneNote', icon: '📓', available: true }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Platform Integrations</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-8">
        <h2 className="font-semibold text-blue-800 mb-2">What you can do:</h2>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Import and sync documents from external platforms</li>
          <li>• Keep your knowledge base synchronized across platforms</li>
          <li>• Export KnowledgeHub documents to your preferred platforms</li>
        </ul>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.available && setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : tab.available 
                    ? 'border-transparent text-gray-500 hover:text-gray-700'
                    : 'border-transparent text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.name}</span>
              {!tab.available && <span className="text-xs">(Coming Soon)</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'google-drive' && (
          <GoogleDriveIntegration onImportSuccess={handleImportSuccess} />
        )}
        
        {/* ✅ NEW - Notion Integration */}
        {activeTab === 'notion' && (
          <NotionIntegration onImportSuccess={handleImportSuccess} />
        )}
        
        {/* ✅ NEW - OneNote Integration */}
        {activeTab === 'onenote' && (
          <OneNoteIntegration onImportSuccess={handleImportSuccess} />
        )}
      </div>

      {/* Integration Stats */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h4 className="font-medium text-gray-900">Auto-Sync</h4>
            <p className="text-sm text-gray-600">Keep documents synchronized across all platforms</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h4 className="font-medium text-gray-900">Centralized</h4>
            <p className="text-sm text-gray-600">Access all your academic content in one place</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h4 className="font-medium text-gray-900">Collaborative</h4>
            <p className="text-sm text-gray-600">Share and collaborate seamlessly across platforms</p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500">💡</span>
            <div>
              <p className="font-medium text-gray-800">Getting Started</p>
              <p>Connect your platforms one by one. Each integration will guide you through the setup process.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-green-500">🔒</span>
            <div>
              <p className="font-medium text-gray-800">Security</p>
              <p>All integrations use secure OAuth protocols. We never store your platform passwords.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-purple-500">⚡</span>
            <div>
              <p className="font-medium text-gray-800">Performance</p>
              <p>Syncing happens in the background. Large imports may take a few minutes to complete.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;