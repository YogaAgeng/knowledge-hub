import StudyGroup from '../models/StudyGroup.js';
import Document from '../models/Document.js';
import User from '../models/User.js';

import mongoose from 'mongoose';

// Create a new study group
export const createStudyGroup = async (req, res, next) => {
  try {
    const { name, description, subject, semester, isPrivate } = req.body;

    // Validate user hasn't exceeded group limit
    const userGroupCount = await StudyGroup.countDocuments({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    if (userGroupCount >= 5) {
      return next(new AppError('Maximum limit of 5 study groups reached', 400));
    }

    const studyGroup = await StudyGroup.create({
      name,
      description,
      subject,
      semester,
      owner: req.user._id,
      members: [{
        user: req.user._id,
        role: 'owner',
        joinedAt: new Date()
      }],
      isPrivate: isPrivate || false
    });

    await studyGroup.populate('owner', 'nama email profilePicture');
    
    res.status(201).json({
      status: 'success',
      data: { studyGroup }
    });
  } catch (error) {
    console.error('Create study group error:', error);
    next(new AppError('Failed to create study group', 500));
  }
};

// Get all study groups (with filters)
export const getStudyGroups = async (req, res, next) => {
  try {
    const { subject, semester, search, joined } = req.query;
    const query = {};

    // Filter by subject
    if (subject) {
      query.subject = subject;
    }

    // Filter by semester
    if (semester) {
      query.semester = semester;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by user's joined groups
    if (joined === 'true') {
      query['members.user'] = req.user._id;
    } else if (joined === 'false') {
      // Show only public groups user hasn't joined
      query.isPrivate = false;
      query['members.user'] = { $ne: req.user._id };
    }

    const studyGroups = await StudyGroup.find(query)
      .populate('owner', 'nama email profilePicture')
      .populate('members.user', 'nama email profilePicture')
      .sort('-createdAt');

    // Add metadata for each group
    const groupsWithMetadata = await Promise.all(
      studyGroups.map(async (group) => {
        const documentCount = await Document.countDocuments({
          studyGroup: group._id
        });

        const recentActivity = await Document.findOne({
          studyGroup: group._id
        }).sort('-createdAt').select('createdAt');

        return {
          ...group.toObject(),
          stats: {
            memberCount: group.members.length,
            documentCount,
            lastActivity: recentActivity?.createdAt || group.createdAt
          },
          isMember: group.members.some(m => m.user._id.toString() === req.user._id.toString())
        };
      })
    );

    res.json({
      status: 'success',
      results: groupsWithMetadata.length,
      data: { studyGroups: groupsWithMetadata }
    });
  } catch (error) {
    console.error('Get study groups error:', error);
    next(new AppError('Failed to fetch study groups', 500));
  }
};

// Get single study group with details
export const getStudyGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const studyGroup = await StudyGroup.findById(id)
      .populate('owner', 'nama email profilePicture')
      .populate('members.user', 'nama email profilePicture');

    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    // Check if user is member or if group is public
    const isMember = studyGroup.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );

    if (studyGroup.isPrivate && !isMember) {
      return next(new AppError('Access denied to private study group', 403));
    }

    // Get group documents
    const documents = await Document.find({ studyGroup: id })
      .populate('userId', 'nama email')
      .sort('-createdAt')
      .limit(20);

    // Get group statistics
    const stats = {
      memberCount: studyGroup.members.length,
      documentCount: await Document.countDocuments({ studyGroup: id }),
      discussionCount: documents.reduce((acc, doc) => acc + (doc.discussions?.length || 0), 0),
      activeDays: Math.floor((Date.now() - studyGroup.createdAt) / (1000 * 60 * 60 * 24))
    };

    res.json({
      status: 'success',
      data: {
        studyGroup,
        documents,
        stats,
        isMember,
        userRole: isMember ? 
          studyGroup.members.find(m => m.user._id.toString() === req.user._id.toString()).role : 
          null
      }
    });
  } catch (error) {
    console.error('Get study group error:', error);
    next(new AppError('Failed to fetch study group details', 500));
  }
};

// Join a study group
export const joinStudyGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { joinCode } = req.body;

    const studyGroup = await StudyGroup.findById(id);

    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    // Check if already a member
    const existingMember = studyGroup.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (existingMember) {
      return next(new AppError('You are already a member of this group', 400));
    }

    // Check if group is full (max 10 members)
    if (studyGroup.members.length >= 10) {
      return next(new AppError('Study group is full', 400));
    }

    // Check if private and validate join code
    if (studyGroup.isPrivate) {
      if (!joinCode || joinCode !== studyGroup.joinCode) {
        return next(new AppError('Invalid join code', 401));
      }
    }

    // Add user as member
    studyGroup.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: new Date()
    });

    await studyGroup.save();

    // Create activity log
    await studyGroup.addActivity(req.user._id, 'joined', {
      userName: req.user.nama
    });

    await studyGroup.populate('members.user', 'nama email profilePicture');

    res.json({
      status: 'success',
      message: 'Successfully joined study group',
      data: { studyGroup }
    });
  } catch (error) {
    console.error('Join study group error:', error);
    next(new AppError('Failed to join study group', 500));
  }
};

// Leave a study group
export const leaveStudyGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const studyGroup = await StudyGroup.findById(id);

    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    const memberIndex = studyGroup.members.findIndex(
      m => m.user.toString() === req.user._id.toString()
    );

    if (memberIndex === -1) {
      return next(new AppError('You are not a member of this group', 400));
    }

    const member = studyGroup.members[memberIndex];

    // Prevent owner from leaving (must delete group instead)
    if (member.role === 'owner') {
      return next(new AppError('Owner cannot leave the group. Delete the group instead.', 400));
    }

    // Remove member
    studyGroup.members.splice(memberIndex, 1);
    await studyGroup.save();

    // Create activity log
    await studyGroup.addActivity(req.user._id, 'left', {
      userName: req.user.nama
    });

    res.json({
      status: 'success',
      message: 'Successfully left study group'
    });
  } catch (error) {
    console.error('Leave study group error:', error);
    next(new AppError('Failed to leave study group', 500));
  }
};

// Update study group (owner only)
export const updateStudyGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, subject, semester, isPrivate } = req.body;

    const studyGroup = await StudyGroup.findById(id);

    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    // Check if user is owner
    if (studyGroup.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Only group owner can update group settings', 403));
    }

    // Update fields
    if (name) studyGroup.name = name;
    if (description) studyGroup.description = description;
    if (subject) studyGroup.subject = subject;
    if (semester) studyGroup.semester = semester;
    if (typeof isPrivate === 'boolean') {
      studyGroup.isPrivate = isPrivate;
      // Generate new join code if making private
      if (isPrivate && !studyGroup.joinCode) {
        studyGroup.joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    }

    await studyGroup.save();
    await studyGroup.populate('members.user', 'nama email profilePicture');

    res.json({
      status: 'success',
      data: { studyGroup }
    });
  } catch (error) {
    console.error('Update study group error:', error);
    next(new AppError('Failed to update study group', 500));
  }
};

// Delete study group (owner only)
export const deleteStudyGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const studyGroup = await StudyGroup.findById(id);

    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    // Check if user is owner
    if (studyGroup.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Only group owner can delete the group', 403));
    }

    // Delete all associated documents
    await Document.deleteMany({ studyGroup: id });

    // Delete the group
    await studyGroup.deleteOne();

    res.json({
      status: 'success',
      message: 'Study group deleted successfully'
    });
  } catch (error) {
    console.error('Delete study group error:', error);
    next(new AppError('Failed to delete study group', 500));
  }
};

// Share document to study group
export const shareDocument = async (req, res, next) => {
  try {
    const { groupId, documentId } = req.params;
    const { permission = 'view' } = req.body;

    // Verify document exists and user owns it
    const document = await Document.findById(documentId);
    if (!document) {
      return next(new AppError('Document not found', 404));
    }

    if (document.userId.toString() !== req.user._id.toString()) {
      return next(new AppError('You can only share your own documents', 403));
    }

    // Verify study group exists and user is member
    const studyGroup = await StudyGroup.findById(groupId);
    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    const isMember = studyGroup.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return next(new AppError('You must be a group member to share documents', 403));
    }

    // Update document with study group reference
    document.studyGroup = groupId;
    document.sharedSettings = {
      permission,
      sharedBy: req.user._id,
      sharedAt: new Date()
    };

    await document.save();

    // Add activity
    await studyGroup.addActivity(req.user._id, 'shared_document', {
      documentTitle: document.title,
      documentId: document._id
    });

    res.json({
      status: 'success',
      message: 'Document shared successfully',
      data: { document }
    });
  } catch (error) {
    console.error('Share document error:', error);
    next(new AppError('Failed to share document', 500));
  }
};

// Get study group activities
export const getGroupActivities = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const studyGroup = await StudyGroup.findById(id)
      .select('activities')
      .populate('activities.user', 'nama email profilePicture');

    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    // Check if user is member
    const isMember = await StudyGroup.exists({
      _id: id,
      'members.user': req.user._id
    });

    if (!isMember) {
      return next(new AppError('Access denied. Members only.', 403));
    }

    // Paginate activities
    const activities = studyGroup.activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(offset, offset + limit);

    res.json({
      status: 'success',
      data: {
        activities,
        hasMore: studyGroup.activities.length > offset + limit
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    next(new AppError('Failed to fetch activities', 500));
  }
};

// Invite members (owner/admin only)
export const inviteMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return next(new AppError('Please provide an array of email addresses', 400));
    }

    const studyGroup = await StudyGroup.findById(id);
    if (!studyGroup) {
      return next(new AppError('Study group not found', 404));
    }

    // Check permissions
    const member = studyGroup.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['owner', 'admin'].includes(member.role)) {
      return next(new AppError('Only owners and admins can invite members', 403));
    }

    // Find users by email
    const users = await User.find({ email: { $in: emails } });
    
    const results = {
      invited: [],
      alreadyMember: [],
      notFound: []
    };

    for (const email of emails) {
      const user = users.find(u => u.email === email);
      
      if (!user) {
        results.notFound.push(email);
        continue;
      }

      const isAlreadyMember = studyGroup.members.some(
        m => m.user.toString() === user._id.toString()
      );

      if (isAlreadyMember) {
        results.alreadyMember.push(email);
        continue;
      }

      // Add invitation logic here (could be notifications, emails, etc.)
      results.invited.push(email);
    }

    res.json({
      status: 'success',
      message: 'Invitations processed',
      data: results
    });
  } catch (error) {
    console.error('Invite members error:', error);
    next(new AppError('Failed to invite members', 500));
  }
};