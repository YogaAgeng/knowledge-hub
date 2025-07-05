import { useState, useEffect } from 'react';
import * as api from '../api/apiService';

export const useAcademicPermissions = (documentId) => {
  const [permissions, setPermissions] = useState({
    canView: false,
    canEdit: false,
    canComment: false,
    canInvite: false,
    canManage: false,
    userRole: null,
    documentType: null,
    academicConstraints: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.getDocumentPermissions(documentId);
        setPermissions(response);
      } catch (err) {
        console.error('Failed to fetch permissions:', err);
        setError(err.message || 'Failed to load permissions');
        
        // Set default permissions on error
        setPermissions({
          canView: false,
          canEdit: false,
          canComment: false,
          canInvite: false,
          canManage: false,
          userRole: null,
          documentType: null,
          academicConstraints: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [documentId]);

  const refreshPermissions = async () => {
    if (!documentId) return;
    
    try {
      const response = await api.getDocumentPermissions(documentId);
      setPermissions(response);
    } catch (err) {
      console.error('Failed to refresh permissions:', err);
      setError(err.message || 'Failed to refresh permissions');
    }
  };

  return {
    permissions,
    loading,
    error,
    refreshPermissions,
    
    // Convenience getters
    canView: permissions.canView,
    canEdit: permissions.canEdit,
    canComment: permissions.canComment,
    canInvite: permissions.canInvite,
    canManage: permissions.canManage,
    userRole: permissions.userRole,
    documentType: permissions.documentType,
    academicConstraints: permissions.academicConstraints,
    
    // Helper functions
    isOwner: permissions.userRole === 'owner',
    isEditor: permissions.userRole === 'editor',
    isViewer: permissions.userRole === 'viewer',
    
    // Academic helpers
    getMaxCollaborators: () => permissions.academicConstraints?.maxCollaborators || 10,
    getAllowedRoles: () => permissions.academicConstraints?.allowedRoles || [],
    getExpiryDays: () => permissions.academicConstraints?.defaultExpiry,
    getDescription: () => permissions.academicConstraints?.description || ''
  };
};

export default useAcademicPermissions;