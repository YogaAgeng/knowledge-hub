// ===== /backend/controllers/collaborationControllers.js =====
import Document from '../models/Document.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// @desc    Enable collaboration for a document
// @route   POST /api/documents/:id/collaboration/enable
// @access  Private (Owner only)
export const enableCollaboration = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user is owner
    if (document.penulis.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Hanya pemilik dokumen yang dapat mengaktifkan kolaborasi'
      });
    }

    // Enable collaboration
    document.collaborationEnabled = true;
    document.collaborators = document.collaborators || [];
    
    // Add owner as collaborator if not already
    if (!document.collaborators.some(c => c.user.toString() === req.user.id)) {
      document.collaborators.push({
        user: req.user.id,
        role: 'owner',
        joinedAt: new Date()
      });
    }

    await document.save();

    res.json({
      success: true,
      message: 'Kolaborasi berhasil diaktifkan',
      data: { document }
    });
  } catch (error) {
    console.error('Enable collaboration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Disable collaboration for a document
// @route   POST /api/documents/:id/collaboration/disable
// @access  Private (Owner only)
export const disableCollaboration = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user is owner
    if (document.penulis.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Hanya pemilik dokumen yang dapat menonaktifkan kolaborasi'
      });
    }

    // Disable collaboration
    document.collaborationEnabled = false;
    document.collaborators = [];
    
    await document.save();

    res.json({
      success: true,
      message: 'Kolaborasi berhasil dinonaktifkan',
      data: { document }
    });
  } catch (error) {
    console.error('Disable collaboration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Invite collaborator to document
// @route   POST /api/documents/:id/collaboration/invite
// @access  Private (Owner/Admin only)
export const inviteCollaborator = async (req, res) => {
  try {
    const { email, role = 'editor', message } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user has permission to invite
    const userRole = document.collaborators?.find(c => c.user.toString() === req.user.id)?.role;
    if (document.penulis.toString() !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengundang kolaborator'
      });
    }

    // Find user by email
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User dengan email tersebut tidak ditemukan'
      });
    }

    // Check if already a collaborator
    if (document.collaborators?.some(c => c.user.toString() === invitedUser._id.toString())) {
      return res.status(400).json({
        success: false,
        message: 'User sudah menjadi kolaborator'
      });
    }

    // Create invitation token
    const inviteToken = jwt.sign(
      { 
        documentId: document._id,
        userId: invitedUser._id,
        role,
        invitedBy: req.user.id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Add to pending invitations
    if (!document.pendingInvitations) {
      document.pendingInvitations = [];
    }
    
    document.pendingInvitations.push({
      user: invitedUser._id,
      email: invitedUser.email,
      role,
      token: inviteToken,
      invitedBy: req.user.id,
      invitedAt: new Date(),
      message
    });

    await document.save();

    // In production, send email notification
    // For now, return the token
    res.json({
      success: true,
      message: 'Undangan berhasil dikirim',
      data: {
        inviteToken, // Remove in production
        inviteLink: `${process.env.FRONTEND_URL}/collaborate/accept/${inviteToken}`
      }
    });
  } catch (error) {
    console.error('Invite collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get document collaborators
// @route   GET /api/documents/:id/collaboration/collaborators
// @access  Private (Collaborators only)
export const getCollaborators = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('collaborators.user', 'nama email nim jurusan')
      .populate('pendingInvitations.user', 'nama email')
      .populate('pendingInvitations.invitedBy', 'nama email');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user has access
    const hasAccess = 
      document.penulis.toString() === req.user.id ||
      document.collaborators?.some(c => c.user._id.toString() === req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke dokumen ini'
      });
    }

    res.json({
      success: true,
      data: {
        collaborators: document.collaborators || [],
        pendingInvitations: document.pendingInvitations || []
      }
    });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove collaborator from document
// @route   DELETE /api/documents/:id/collaboration/collaborators/:userId
// @access  Private (Owner/Admin only)
export const removeCollaborator = async (req, res) => {
  try {
    const { id: documentId, userId } = req.params;
    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user has permission
    const userRole = document.collaborators?.find(c => c.user.toString() === req.user.id)?.role;
    if (document.penulis.toString() !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk menghapus kolaborator'
      });
    }

    // Cannot remove owner
    if (userId === document.penulis.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus pemilik dokumen'
      });
    }

    // Remove collaborator
    document.collaborators = document.collaborators.filter(
      c => c.user.toString() !== userId
    );

    // Also remove from access users if exists
    document.aksesUsers = document.aksesUsers.filter(
      id => id.toString() !== userId
    );

    await document.save();

    res.json({
      success: true,
      message: 'Kolaborator berhasil dihapus',
      data: { document }
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update collaborator role
// @route   PUT /api/documents/:id/collaboration/collaborators/:userId
// @access  Private (Owner/Admin only)
export const updateCollaboratorRole = async (req, res) => {
  try {
    const { id: documentId, userId } = req.params;
    const { role } = req.body;
    
    if (!['viewer', 'editor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak valid'
      });
    }

    const document = await Document.findById(documentId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user has permission
    const userRole = document.collaborators?.find(c => c.user.toString() === req.user.id)?.role;
    if (document.penulis.toString() !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki izin untuk mengubah role kolaborator'
      });
    }

    // Find and update collaborator role
    const collaborator = document.collaborators.find(c => c.user.toString() === userId);
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Kolaborator tidak ditemukan'
      });
    }

    // Cannot change owner role
    if (collaborator.role === 'owner') {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat mengubah role pemilik dokumen'
      });
    }

    collaborator.role = role;
    await document.save();

    res.json({
      success: true,
      message: 'Role kolaborator berhasil diubah',
      data: { document }
    });
  } catch (error) {
    console.error('Update collaborator role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Accept collaboration invitation
// @route   POST /api/collaborate/accept/:token
// @access  Private
export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token undangan tidak valid atau sudah kadaluarsa'
      });
    }

    // Check if user matches
    if (decoded.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Token undangan tidak untuk user ini'
      });
    }

    const document = await Document.findById(decoded.documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if already a collaborator
    if (document.collaborators?.some(c => c.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah menjadi kolaborator'
      });
    }

    // Add as collaborator
    if (!document.collaborators) {
      document.collaborators = [];
    }
    
    document.collaborators.push({
      user: req.user.id,
      role: decoded.role,
      joinedAt: new Date()
    });

    // Add to access users
    if (!document.aksesUsers.includes(req.user.id)) {
      document.aksesUsers.push(req.user.id);
    }

    // Remove from pending invitations
    document.pendingInvitations = document.pendingInvitations?.filter(
      inv => inv.token !== token
    ) || [];

    await document.save();

    res.json({
      success: true,
      message: 'Berhasil bergabung sebagai kolaborator',
      data: { document }
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reject collaboration invitation
// @route   POST /api/collaborate/reject/:token
// @access  Private
export const rejectInvitation = async (req, res) => {
  try {
    const { token } = req.params;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token undangan tidak valid atau sudah kadaluarsa'
      });
    }

    // Check if user matches
    if (decoded.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Token undangan tidak untuk user ini'
      });
    }

    const document = await Document.findById(decoded.documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Remove from pending invitations
    document.pendingInvitations = document.pendingInvitations?.filter(
      inv => inv.token !== token
    ) || [];

    await document.save();

    res.json({
      success: true,
      message: 'Undangan berhasil ditolak'
    });
  } catch (error) {
    console.error('Reject invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};