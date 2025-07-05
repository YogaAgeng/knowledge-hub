/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/apiClient';

const NotionIntegration = ({ onImportSuccess }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notionToken, setNotionToken] = useState('');
  const [databases, setDatabases] = useState([]);
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await apiClient.get('/integrations/notion/status');
      setIsConnected(response.data.connected);
      if (response.data.connected) {
        fetchDatabases();
      }
    } catch (error) {
      console.error('Failed to check Notion status:', error);
    }
  };

  const fetchDatabases = async () => {
    try {
      const response = await apiClient.get('/integrations/notion/databases');
      setDatabases(response.data.databases || []);
    } catch (error) {
      console.error('Failed to fetch databases:', error);
    }
  };

  const connectNotion = async () => {
    if (!notionToken.trim()) {
      toast.error('Please enter your Notion integration token');
      return;
    }

    if (notionToken.length < 20) {
      toast.error('Invalid token format. Please check your Notion integration token.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/integrations/notion/connect', { 
        notionToken: notionToken.trim() 
      });
      setIsConnected(true);
      setNotionToken('');
      setShowTokenInput(false);
      toast.success('Notion connected successfully!');
      fetchDatabases();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to connect Notion';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const importFromNotion = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/integrations/notion/import');
      toast.success(`${response.data.importedCount} pages imported from Notion!`);
      
      // Show imported pages summary
      if (response.data.pages && response.data.pages.length > 0) {
        const pagesList = response.data.pages.map(page => `• ${page.title} (${page.type})`).join('\n');
        console.log('Imported pages:', pagesList);
      }
      
      if (onImportSuccess) onImportSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to import from Notion';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Notion? You can reconnect anytime.')) {
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/integrations/notion/disconnect');
      setIsConnected(false);
      setDatabases([]);
      toast.success('Notion disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect Notion');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Connect Notion</h3>
            <p className="text-gray-600 mb-6">
              Import your notes and databases from your Notion workspace
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">What you can import:</h4>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• 📄 Pages and notes from your workspace</li>
                <li>• 🗂️ Database entries and structured content</li>
                <li>• 📚 Study materials and research notes</li>
                <li>• 📝 Project documentation and meeting notes</li>
              </ul>
            </div>

            {!showTokenInput ? (
              <button
                onClick={() => setShowTokenInput(true)}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition font-medium"
              >
                Connect Notion Workspace
              </button>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notion Integration Token
                  </label>
                  <input
                    type="password"
                    value={notionToken}
                    onChange={(e) => setNotionToken(e.target.value)}
                    placeholder="secret_••••••••••••••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowTokenInput(false);
                      setNotionToken('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={connectNotion}
                    disabled={loading || !notionToken.trim()}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-2">How to get your integration token:</p>
            <ol className="space-y-1 ml-4">
              <li>1. Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">notion.so/my-integrations</a></li>
              <li>2. Click "Create new integration"</li>
              <li>3. Give it a name (e.g., "KnowledgeHub")</li>
              <li>4. Select your workspace</li>
              <li>5. Copy the "Internal Integration Token"</li>
              <li>6. Don't forget to share your pages with the integration!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">📝</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Notion</h3>
              <p className="text-sm text-green-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Connected
              </p>
            </div>
          </div>
          
          <button
            onClick={disconnect}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Import Section */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Import from Notion</h4>
          <p className="text-gray-600 text-sm mb-4">
            Import pages and notes from your Notion workspace. We'll automatically convert them to KnowledgeHub documents.
          </p>
          
          <button
            onClick={importFromNotion}
            disabled={loading}
            className="w-full bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-900 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing from Notion...
              </span>
            ) : (
              'Import Pages from Notion'
            )}
          </button>
        </div>

        {/* Available Databases */}
        {databases.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Available Databases</h4>
            <div className="space-y-2">
              {databases.map(database => (
                <div 
                  key={database.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{database.title}</p>
                    <p className="text-sm text-gray-600">{database.description}</p>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Database
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features & Benefits */}
        <div className="border-t pt-6 mt-6">
          <h4 className="font-semibold text-gray-800 mb-3">Integration Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <FeatureItem
                icon="📄"
                title="Page Import"
                description="Import individual pages and nested content"
              />
              <FeatureItem
                icon="🗂️"
                title="Database Sync"
                description="Convert database entries to documents"
              />
            </div>
            <div className="space-y-3">
              <FeatureItem
                icon="🏷️"
                title="Auto-Tagging"
                description="Automatically tag imported content"
              />
              <FeatureItem
                icon="📊"
                title="Metadata Preservation"
                description="Keep creation dates and properties"
              />
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="border-t pt-6 mt-6">
          <h4 className="font-semibold text-gray-800 mb-3">Sync Preferences</h4>
          <div className="space-y-3">
            <SyncToggle
              label="Auto-import new pages"
              description="Automatically import new pages added to shared databases"
              defaultChecked={false}
            />
            <SyncToggle
              label="Import page properties"
              description="Include Notion properties as document metadata"
              defaultChecked={true}
            />
            <SyncToggle
              label="Convert blocks to markdown"
              description="Convert Notion blocks to markdown formatting"
              defaultChecked={true}
            />
          </div>
        </div>

        {/* Last Sync Info */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last import: Never</span>
            <button 
              onClick={checkStatus}
              className="text-blue-600 hover:text-blue-800"
            >
              Refresh connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const FeatureItem = ({ icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="text-lg">{icon}</div>
    <div>
      <p className="font-medium text-gray-800 text-sm">{title}</p>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  </div>
);

const SyncToggle = ({ label, description, defaultChecked, onChange }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1 mr-4">
        <p className="font-medium text-gray-800 text-sm">{label}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isChecked ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default NotionIntegration;