export const ACADEMIC_CONSTRAINTS = {
  'tugas': {
    maxCollaborators: 5,
    allowedRoles: ['owner', 'editor'],
    defaultExpiry: 30, // days
    description: 'Group assignment collaboration',
    features: ['edit', 'comment', 'view']
  },
  'makalah': {
    maxCollaborators: 3,
    allowedRoles: ['owner', 'editor', 'viewer'],
    defaultExpiry: 90, // days  
    description: 'Academic paper collaboration',
    features: ['edit', 'comment', 'view', 'review']
  },
  'catatan': {
    maxCollaborators: 10,
    allowedRoles: ['owner', 'viewer'],
    defaultExpiry: null, // no expiry
    description: 'Study notes sharing',
    features: ['view', 'comment']
  }
};

// Get permissions for a specific role and document type
export const getPermissions = (userRole, documentType) => {
  const basePermissions = {
    owner: { 
      read: true, 
      write: true, 
      invite: true, 
      manage: true, 
      comment: true,
      delete: true 
    },
    editor: { 
      read: true, 
      write: true, 
      invite: false, 
      manage: false, 
      comment: true,
      delete: false 
    },
    viewer: { 
      read: true, 
      write: false, 
      invite: false, 
      manage: false, 
      comment: true,
      delete: false 
    }
  };
  
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  const userPermissions = basePermissions[userRole] || basePermissions.viewer;
  
  // Apply academic constraints
  if (constraints) {
    // Override write permission based on document type rules
    if (userRole === 'editor' && !constraints.allowedRoles.includes('editor')) {
      userPermissions.write = false;
    }
    
    // Override comment permission based on features
    if (!constraints.features.includes('comment')) {
      userPermissions.comment = false;
    }
  }
  
  return {
    ...userPermissions,
    constraints
  };
};

// Check if a role is allowed for a document type
export const isRoleAllowed = (role, documentType) => {
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  return constraints ? constraints.allowedRoles.includes(role) : true;
};

// Get available roles for a document type
export const getAvailableRoles = (documentType, excludeOwner = true) => {
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  const roles = constraints ? constraints.allowedRoles : ['owner', 'editor', 'viewer'];
  
  return excludeOwner ? roles.filter(role => role !== 'owner') : roles;
};

// Check if more collaborators can be added
export const canAddCollaborator = (currentCount, documentType) => {
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  return constraints ? currentCount < constraints.maxCollaborators : true;
};

// Get collaboration limits for a document type
export const getCollaborationLimits = (documentType) => {
  return ACADEMIC_CONSTRAINTS[documentType] || {
    maxCollaborators: 10,
    allowedRoles: ['owner', 'editor', 'viewer'],
    defaultExpiry: null,
    description: 'Document collaboration'
  };
};

// Check if collaboration has expired
export const hasCollaborationExpired = (acceptedAt, documentType) => {
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  
  if (!constraints?.defaultExpiry || !acceptedAt) {
    return false;
  }
  
  const expiryDate = new Date(acceptedAt);
  expiryDate.setDate(expiryDate.getDate() + constraints.defaultExpiry);
  
  return new Date() > expiryDate;
};

// Format expiry date for display
export const formatExpiryDate = (acceptedAt, documentType) => {
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  
  if (!constraints?.defaultExpiry || !acceptedAt) {
    return null;
  }
  
  const expiryDate = new Date(acceptedAt);
  expiryDate.setDate(expiryDate.getDate() + constraints.defaultExpiry);
  
  return expiryDate.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get user role badge styling
export const getRoleBadgeStyle = (role) => {
  const styles = {
    owner: 'bg-blue-100 text-blue-800',
    editor: 'bg-purple-100 text-purple-800',
    viewer: 'bg-gray-100 text-gray-800'
  };
  
  return styles[role] || styles.viewer;
};

// Get document type badge styling
export const getDocumentTypeBadgeStyle = (type) => {
  const styles = {
    tugas: 'bg-orange-100 text-orange-800',
    makalah: 'bg-green-100 text-green-800',
    catatan: 'bg-blue-100 text-blue-800'
  };
  
  return styles[type] || styles.catatan;
};

// Validate collaboration data
export const validateCollaboration = (collaborationData, documentType) => {
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  const errors = [];
  
  if (!constraints) {
    errors.push('Invalid document type');
    return { valid: false, errors };
  }
  
  // Check role validation
  if (collaborationData.role && !constraints.allowedRoles.includes(collaborationData.role)) {
    errors.push(`Role '${collaborationData.role}' is not allowed for ${documentType}`);
  }
  
  // Check collaborator count
  if (collaborationData.collaboratorCount >= constraints.maxCollaborators) {
    errors.push(`Maximum ${constraints.maxCollaborators} collaborators allowed for ${documentType}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
