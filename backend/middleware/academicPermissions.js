import Collaboration from '../models/Collaboration.js';
import Document from '../models/Document.js';


// Academic constraints per document type
const ACADEMIC_CONSTRAINTS = {
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

// Validate academic constraints when inviting collaborators
export const validateAcademicConstraints = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { role } = req.body;
    
    const document = await Document.findById(documentId);
    if (!document) {
      return next(new AppError('Document not found', 404));
    }
    
    const constraints = ACADEMIC_CONSTRAINTS[document.type];
    if (!constraints) {
      return next(new AppError('Invalid document type', 400));
    }
    
    // Check if role is allowed for this document type
    if (!constraints.allowedRoles.includes(role)) {
      return next(new AppError(
        `Role '${role}' is not allowed for ${document.type}. Allowed roles: ${constraints.allowedRoles.join(', ')}`,
        400
      ));
    }
    
    // Check collaborator limit
    const collaboration = await Collaboration.findOne({ documentId });
    if (collaboration) {
      const activeCollaborators = collaboration.collaborators.filter(c => c.status === 'accepted');
      if (activeCollaborators.length >= constraints.maxCollaborators) {
        return next(new AppError(
          `Maximum ${constraints.maxCollaborators} collaborators allowed for ${document.type}`,
          400
        ));
      }
    }
    
    // Add constraints to request for later use
    req.academicConstraints = constraints;
    next();
  } catch (error) {
    next(error);
  }
};

// Enhanced permission check with academic context
export const checkAcademicPermissions = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const { documentId } = req.params;
      const userId = req.user.id;
      
      const document = await Document.findById(documentId);
      if (!document) {
        return next(new AppError('Document not found', 404));
      }
      
      // Owner always has access
      if (document.user.toString() === userId) {
        req.userRole = 'owner';
        req.academicConstraints = ACADEMIC_CONSTRAINTS[document.type];
        return next();
      }
      
      // Check collaboration
      const collaboration = await Collaboration.findOne({ documentId });
      if (!collaboration) {
        return next(new AppError('Access denied - Document not shared', 403));
      }
      
      const collaborator = collaboration.collaborators.find(
        c => c.user.toString() === userId && c.status === 'accepted'
      );
      
      if (!collaborator) {
        return next(new AppError('Access denied - Not a collaborator', 403));
      }
      
      // Check if collaboration has expired (for time-limited document types)
      const constraints = ACADEMIC_CONSTRAINTS[document.type];
      if (constraints.defaultExpiry && collaborator.acceptedAt) {
        const expiryDate = new Date(collaborator.acceptedAt);
        expiryDate.setDate(expiryDate.getDate() + constraints.defaultExpiry);
        
        if (new Date() > expiryDate) {
          return next(new AppError('Collaboration access has expired', 403));
        }
      }
      
      // Define permissions for each role
      const rolePermissions = {
        owner: ['read', 'write', 'delete', 'manage', 'invite', 'comment'],
        editor: ['read', 'write', 'comment'],
        viewer: ['read', 'comment']
      };
      
      const userPermissions = rolePermissions[collaborator.role] || [];
      
      if (!userPermissions.includes(requiredPermission)) {
        return next(new AppError(
          `Insufficient permissions. Role '${collaborator.role}' cannot '${requiredPermission}'`,
          403
        ));
      }
      
      req.userRole = collaborator.role;
      req.academicConstraints = constraints;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Get academic constraints for a document type
export const getAcademicConstraints = (documentType) => {
  return ACADEMIC_CONSTRAINTS[documentType] || null;
};

// Check if user can perform action based on academic rules
export const canPerformAction = (userRole, action, documentType) => {
  const constraints = ACADEMIC_CONSTRAINTS[documentType];
  if (!constraints) return false;
  
  const rolePermissions = {
    owner: ['read', 'write', 'delete', 'manage', 'invite', 'comment'],
    editor: ['read', 'write', 'comment'],
    viewer: ['read', 'comment']
  };
  
  return rolePermissions[userRole]?.includes(action) || false;
};

export { ACADEMIC_CONSTRAINTS };