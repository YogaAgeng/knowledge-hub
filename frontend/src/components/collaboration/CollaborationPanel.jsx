/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import * as api from '../../api/apiService';
import SimpleCommentsSection from './SimpleCommentsSection';

const SimpleCollaborationPanel = ({ document, onDocumentUpdate }) => {
  const [collaboration, setCollaboration] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const [academicConstraints, setAcademicConstraints] = useState(null);

  useEffect(() => {
    if (document?._id) {
      fetchCollaborationData();
      fetchPermissions();
    }
  }, [document]);

  const fetchCollaborationData = async () => {
    try {
      setLoading(true);
      const response = await api.getCollaborators(document._id);
      setCollaboration(response.collaboration);
      setUserRole(response.userRole);
    } catch (error) {
      console.error('Failed to fetch collaboration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.getDocumentPermissions(document._id);
      setPermissions(response);
      setAcademicConstraints(response.academicConstraints);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const handleEnableCollaboration = async () => {
    try {
      await api.enableCollaboration(document._id);
      toast.success('Collaboration enabled successfully');
      fetchCollaborationData();
      if (onDocumentUpdate) onDocumentUpdate();
    } catch (error) {
      toast.error('Failed to enable collaboration');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!collaboration) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">Enable Collaboration</h3>
          <p className="text-gray-600 mb-4">
            Allow other students to collaborate on this {document.type}
          </p>
          
          {/* Academic Constraints Info */}
          {academicConstraints && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Academic Guidelines for {document.type}:</h4>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Maximum {academicConstraints.maxCollaborators} collaborators allowed</li>
                <li>• Allowed roles: {academicConstraints.allowedRoles.join(', ')}</li>
                <li>• {academicConstraints.description}</li>
                {academicConstraints.defaultExpiry && (
                  <li>• Access expires after {academicConstraints.defaultExpiry} days</li>
                )}
              </ul>
            </div>
          )}
          
          {permissions.canInvite && (
            <button
              onClick={handleEnableCollaboration}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Enable Collaboration
            </button>
          )}
          
          {!permissions.canInvite && (
            <p className="text-gray-500 text-sm">
              Only the document owner can enable collaboration
            </p>
          )}
        </div>
      </div>
    );
  }

  const isOwner = userRole === 'owner';

  return (
    <div className="space-y-6">
      {/* Collaboration Header with Academic Info */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Collaboration</h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              userRole === 'owner' ? 'bg-blue-100 text-blue-800' :
              userRole === 'editor' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {userRole}
            </span>
            {academicConstraints && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {document.type}
              </span>
            )}
          </div>
        </div>

        {/* Academic Constraints Display */}
        {academicConstraints && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-yellow-500 text-lg">ℹ️</span>
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Academic Rules for {document.type}:</p>
                <p>{academicConstraints.description}</p>
                <p>Collaborators: {collaboration.collaborators?.filter(c => c.status === 'accepted').length || 0}/{academicConstraints.maxCollaborators}</p>
              </div>
            </div>
          </div>
        )}

        {/* Invite Form (Owner Only) */}
        {isOwner && permissions.canInvite && (
          <SimpleInviteForm 
            documentId={document._id}
            documentType={document.type}
            academicConstraints={academicConstraints}
            currentCollaborators={collaboration.collaborators?.filter(c => c.status === 'accepted').length || 0}
            onInviteSuccess={fetchCollaborationData}
          />
        )}

        {/* Collaborator List */}
        <SimpleCollaboratorList
          collaboration={collaboration}
          userRole={userRole}
          academicConstraints={academicConstraints}
          onUpdate={fetchCollaborationData}
        />
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Comments</h3>
        <SimpleCommentsSection
          documentId={document._id}
          userRole={userRole}
          canComment={permissions.canComment}
        />
      </div>
    </div>
  );
};

// Simple Invite Form Component with Academic Validation
const SimpleInviteForm = ({ documentId, documentType, academicConstraints, currentCollaborators, onInviteSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'viewer'
  });
  const [loading, setLoading] = useState(false);

  // Filter allowed roles based on document type
  const allowedRoles = academicConstraints?.allowedRoles || ['viewer', 'editor'];
  const maxCollaborators = academicConstraints?.maxCollaborators || 10;
  const canInvite = currentCollaborators < maxCollaborators;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!canInvite) {
      toast.error(`Maximum ${maxCollaborators} collaborators allowed for ${documentType}`);
      return;
    }

    setLoading(true);
    
    try {
      await api.inviteCollaborator(documentId, {
        email: formData.email.trim(),
        role: formData.role
      });
      
      setFormData({ email: '', role: allowedRoles.includes('viewer') ? 'viewer' : allowedRoles[0] });
      toast.success('Invitation sent successfully!');
      if (onInviteSuccess) onInviteSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send invitation';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!canInvite) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 text-sm">
          Maximum collaborators reached ({maxCollaborators} for {documentType})
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h4 className="font-semibold text-blue-800 mb-3">
        Invite Collaborator ({currentCollaborators}/{maxCollaborators})
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter collaborator's email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role (for {documentType})
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            {allowedRoles.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
                {role === 'viewer' && ' (can view and comment)'}
                {role === 'editor' && ' (can view, comment, and edit)'}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.email.trim()}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Sending...' : 'Send Invitation'}
        </button>
      </form>
    </div>
  );
};

// Simple Collaborator List Component
const SimpleCollaboratorList = ({ collaboration, userRole, academicConstraints, onUpdate }) => {
  const [updatingRoles, setUpdatingRoles] = useState(new Set());

  const handleRoleUpdate = async (collaboratorId, newRole) => {
    // Check if role is allowed for this document type
    if (!academicConstraints?.allowedRoles.includes(newRole)) {
      toast.error(`Role '${newRole}' is not allowed for this document type`);
      return;
    }

    setUpdatingRoles(prev => new Set([...prev, collaboratorId]));
    
    try {
      await api.updateCollaboratorRole(collaboration.documentId, collaboratorId, newRole);
      toast.success('Role updated successfully');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(collaboratorId);
        return newSet;
      });
    }
  };

  const handleRemoveCollaborator = async (collaboratorId, collaboratorName) => {
    if (!confirm(`Remove ${collaboratorName} from this collaboration?`)) {
      return;
    }
    
    try {
      await api.removeCollaborator(collaboration.documentId, collaboratorId);
      toast.success('Collaborator removed successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to remove collaborator');
    }
  };

  const isOwner = userRole === 'owner';
  const activeCollaborators = collaboration.collaborators?.filter(c => c.status === 'accepted') || [];
  const pendingCollaborators = collaboration.collaborators?.filter(c => c.status === 'pending') || [];
  const allowedRoles = academicConstraints?.allowedRoles || ['viewer', 'editor'];

  return (
    <div className="space-y-4">
      {/* Owner */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Document Owner</h4>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {collaboration.owner?.nama?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{collaboration.owner?.nama}</p>
              <p className="text-sm text-gray-600">{collaboration.owner?.jurusan}</p>
            </div>
            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              Owner
            </span>
          </div>
        </div>
      </div>

      {/* Active Collaborators */}
      {activeCollaborators.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">
            Active Collaborators ({activeCollaborators.length})
          </h4>
          <div className="space-y-3">
            {activeCollaborators.map(collaborator => (
              <div key={collaborator._id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {collaborator.user?.nama?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{collaborator.user?.nama}</p>
                      <p className="text-sm text-gray-600">{collaborator.user?.jurusan}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isOwner ? (
                      <select
                        value={collaborator.role}
                        onChange={(e) => handleRoleUpdate(collaborator._id, e.target.value)}
                        disabled={updatingRoles.has(collaborator._id)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {allowedRoles.map(role => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        collaborator.role === 'editor' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                      </span>
                    )}

                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator._id, collaborator.user?.nama)}
                        disabled={updatingRoles.has(collaborator._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {pendingCollaborators.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">
            Pending Invitations ({pendingCollaborators.length})
          </h4>
          <div className="space-y-3">
            {pendingCollaborators.map(collaborator => (
              <div key={collaborator._id} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {collaborator.user?.nama?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{collaborator.user?.nama}</p>
                      <p className="text-sm text-gray-600">Invitation pending</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Pending
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveCollaborator(collaborator._id, collaborator.user?.nama)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeCollaborators.length === 0 && pendingCollaborators.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">👥</div>
          <p className="text-gray-500">No collaborators yet</p>
          {isOwner && (
            <p className="text-sm text-gray-400 mt-1">
              Invite students to collaborate on this {academicConstraints?.description || 'document'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};


export default SimpleCollaborationPanel;