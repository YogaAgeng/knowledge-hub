/* eslint-disable no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import * as api from '../../api/apiService';

const IntegrationCard = ({ integration, onImportSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    try {
      let result;
      
      if (integration.id === 'google-drive') {
        // Simulate Google Drive connection
        result = await api.connectGoogleDrive('demo_auth_code');
      } else if (integration.id === 'notion') {
        if (!token.trim()) {
          toast.error('Please enter your Notion token');
          setLoading(false);
          return;
        }
        result = await api.connectNotion(token);
      } else if (integration.id === 'onenote') {
        // Simulate OneNote connection
        result = await api.connectOneNote('demo_auth_code');
      }

      toast.success(`${integration.name} connected successfully!`);
      setToken('');
      setShowTokenInput(false);
      integration.onStatusChange(true);
    } catch (error) {
      toast.error(`Failed to connect ${integration.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${integration.name}?`)) return;

    setLoading(true);
    try {
      if (integration.id === 'google-drive') {
        await api.disconnectGoogleDrive();
      } else if (integration.id === 'notion') {
        await api.disconnectNotion();
      } else if (integration.id === 'onenote') {
        await api.disconnectOneNote();
      }

      toast.success(`${integration.name} disconnected`);
      integration.onStatusChange(false);
    } catch (error) {
      toast.error(`Failed to disconnect ${integration.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      let result;
      
      if (integration.id === 'google-drive') {
        result = await api.importFromGoogleDrive();
      } else if (integration.id === 'notion') {
        result = await api.importFromNotion();
      } else if (integration.id === 'onenote') {
        result = await api.importFromOneNote();
      }

      toast.success(`${result.importedCount} documents imported from ${integration.name}!`);
      if (onImportSuccess) onImportSuccess(result);
    } catch (error) {
      toast.error(`Failed to import from ${integration.name}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${integration.connected ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{integration.icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{integration.name}</h3>
              <p className={`text-sm flex items-center ${
                integration.connected ? 'text-green-600' : 'text-gray-500'
              }`}>
                {integration.connected && <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>}
                {integration.connected ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>
          
          {integration.connected && (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm disabled:opacity-50"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!integration.connected ? (
          <div className="text-center">
            <div className="text-6xl mb-4">{integration.icon}</div>
            <h4 className="text-lg font-semibold mb-2">Connect {integration.name}</h4>
            <p className="text-gray-600 mb-6">{integration.description}</p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h5 className="font-semibold text-blue-800 mb-2">What you can import:</h5>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                {integration.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>

            {integration.id === 'notion' && !showTokenInput ? (
              <button
                onClick={() => setShowTokenInput(true)}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition font-medium"
              >
                Connect Notion Workspace
              </button>
            ) : integration.id === 'notion' && showTokenInput ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notion Integration Token
                  </label>
                  <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="secret_••••••••••••••••••••"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowTokenInput(false);
                      setToken('');
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={loading || !token.trim()}
                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Connecting...' : `Connect ${integration.name}`}
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Import Section */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Import from {integration.name}</h4>
              <p className="text-gray-600 text-sm mb-4">
                Import documents and notes from your {integration.name} workspace.
              </p>
              
              <button
                onClick={handleImport}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing from {integration.name}...
                  </span>
                ) : (
                  `Import from ${integration.name}`
                )}
              </button>
            </div>

            {/* Features */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-800 mb-3">Connected Features</h4>
              <div className="grid grid-cols-1 gap-3">
                {integration.connectedFeatures?.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="text-lg">{feature.icon}</div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{feature.title}</p>
                      <p className="text-xs text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                )) || (
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">✅</div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Import Documents</p>
                      <p className="text-xs text-gray-600">Import your existing documents and notes</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Help Section for Notion */}
      {integration.id === 'notion' && !integration.connected && (
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-2">How to get your integration token:</p>
            <ol className="space-y-1 ml-4">
              <li>1. Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">notion.so/my-integrations</a></li>
              <li>2. Click "Create new integration"</li>
              <li>3. Give it a name and select your workspace</li>
              <li>4. Copy the "Internal Integration Token"</li>
              <li>5. Share your pages with the integration</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Integration Page Component
const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: '🗂️',
      description: 'Import and sync your documents from Google Drive',
      connected: false,
      features: [
        'Import Google Docs and text files',
        'Maintain document formatting',
        'Auto-categorize by file type',
        'Preserve creation dates'
      ],
      connectedFeatures: [
        {
          icon: '📄',
          title: 'Document Import',
          description: 'Import docs and text files'
        },
        {
          icon: '🔄',
          title: 'Auto-Sync',
          description: 'Keep documents synchronized'
        }
      ]
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      description: 'Import your notes and databases from Notion workspace',
      connected: false,
      features: [
        'Import pages and notes',
        'Convert database entries',
        'Preserve block formatting',
        'Import properties as metadata'
      ],
      connectedFeatures: [
        {
          icon: '📚',
          title: 'Page Import',
          description: 'Import individual pages'
        },
        {
          icon: '🗂️',
          title: 'Database Sync',
          description: 'Convert entries to documents'
        }
      ]
    },
    {
      id: 'onenote',
      name: 'Microsoft OneNote',
      icon: '📓',
      description: 'Import your notebooks and notes from OneNote',
      connected: false,
      features: [
        'Import complete notebooks',
        'Preserve rich content',
        'Maintain section organization',
        'Import links and attachments'
      ],
      connectedFeatures: [
        {
          icon: '📚',
          title: 'Notebook Import',
          description: 'Import complete notebooks'
        },
        {
          icon: '📊',
          title: 'Rich Content',
          description: 'Preserve formatting and media'
        }
      ]
    }
  ]);

  const [loading, setLoading] = useState(true);

  useState(() => {
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    try {
      setLoading(true);
      const [gdStatus, notionStatus, oneNoteStatus] = await Promise.all([
        api.getGoogleDriveStatus().catch(() => ({ connected: false })),
        api.getNotionStatus().catch(() => ({ connected: false })),
        api.getOneNoteStatus().catch(() => ({ connected: false }))
      ]);

      setIntegrations(prev => prev.map(integration => ({
        ...integration,
        connected: 
          integration.id === 'google-drive' ? gdStatus.connected :
          integration.id === 'notion' ? notionStatus.connected :
          integration.id === 'onenote' ? oneNoteStatus.connected :
          false
      })));
    } catch (error) {
      console.error('Failed to load integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (integrationId, connected) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, connected }
        : integration
    ));
  };

  const handleImportSuccess = (data) => {
    if (data?.importedCount) {
      toast.success(`Successfully imported ${data.importedCount} documents!`);
    }
    console.log('Import success data:', data);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Platform Integrations</h1>
      
      {/* Overview */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="font-semibold text-blue-800 mb-3">
          Connected Platforms: {connectedCount}/3
        </h2>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Import and sync documents from external platforms</li>
          <li>• Keep your knowledge base synchronized across platforms</li>
          <li>• Maintain document formatting and metadata</li>
        </ul>
      </div>
      
      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <IntegrationCard
            key={integration.id}
            integration={{
              ...integration,
              onStatusChange: (connected) => handleStatusChange(integration.id, connected)
            }}
            onImportSuccess={handleImportSuccess}
          />
        ))}
      </div>

      {/* Benefits Section */}
      <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
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
              <p>Imports happen in the background. Large imports may take a few minutes to complete.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { IntegrationCard, IntegrationsPage };
export default IntegrationsPage;