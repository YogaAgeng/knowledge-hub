// ===== /backend/controllers/discussionControllers.js =====
import Discussion from '../models/Discussion.js';
import Comment from '../models/Comment.js';
import Document from '../models/Document.js';

// @desc    Get discussions for a document
// @route   GET /api/documents/:documentId/discussions
// @access  Private
export const getDiscussions = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { page = 1, limit = 20, tipe } = req.query;

    // Check if document exists and user has access
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check access
    const hasAccess = 
      document.akses === 'public' ||
      document.penulis.toString() === req.user.id ||
      document.aksesUsers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke dokumen ini'
      });
    }

    // Build query
    const query = { dokumenId: documentId };
    if (tipe) query.tipe = tipe;

    // Get discussions with pagination
    const skip = (page - 1) * limit;
    const discussions = await Discussion.find(query)
      .populate('userId', 'nama email avatar')
      .populate({
        path: 'balasan',
        populate: {
          path: 'userId',
          select: 'nama email avatar'
        }
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Discussion.countDocuments(query);

    res.json({
      success: true,
      data: {
        discussions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new discussion
// @route   POST /api/documents/:documentId/discussions
// @access  Private
export const createDiscussion = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { konten, tipe = 'comment', posisi, highlightedText } = req.body;

    // Check if document exists and user has access
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check access
    const hasAccess = 
      document.akses === 'public' ||
      document.penulis.toString() === req.user.id ||
      document.aksesUsers.includes(req.user.id);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke dokumen ini'
      });
    }

    // Create discussion
    const discussion = await Discussion.create({
      dokumenId: documentId,
      userId: req.user.id,
      konten,
      tipe,
      posisi,
      highlightedText
    });

    // Populate user info
    await discussion.populate('userId', 'nama email avatar');

    res.status(201).json({
      success: true,
      data: { discussion }
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update discussion
// @route   PUT /api/discussions/:id
// @access  Private (Author only)
export const updateDiscussion = async (req, res) => {
  try {
    const { konten, tipe } = req.body;

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Diskusi tidak ditemukan'
      });
    }

    // Check if user is author
    if (discussion.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak dapat mengedit diskusi orang lain'
      });
    }

    // Update discussion
    if (konten) discussion.konten = konten;
    if (tipe) discussion.tipe = tipe;
    discussion.isEdited = true;
    discussion.editedAt = new Date();

    await discussion.save();
    await discussion.populate('userId', 'nama email avatar');

    res.json({
      success: true,
      data: { discussion }
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private (Author or Document owner)
export const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Diskusi tidak ditemukan'
      });
    }

    // Get document to check ownership
    const document = await Document.findById(discussion.dokumenId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user can delete (author or document owner)
    const canDelete = 
      discussion.userId.toString() === req.user.id ||
      document.penulis.toString() === req.user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak dapat menghapus diskusi ini'
      });
    }

    // Delete all related comments first
    await Comment.deleteMany({ discussionId: discussion._id });

    // Delete discussion
    await discussion.deleteOne();

    res.json({
      success: true,
      message: 'Diskusi berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add reaction to discussion
// @route   POST /api/discussions/:id/reactions
// @access  Private
export const addReaction = async (req, res) => {
  try {
    const { type } = req.body;
    const validReactions = ['like', 'helpful', 'insightful', 'question'];

    if (!type || !validReactions.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipe reaksi tidak valid'
      });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Diskusi tidak ditemukan'
      });
    }

    // Initialize reactions if not exists
    if (!discussion.reactions) {
      discussion.reactions = [];
    }

    // Check if user already reacted
    const existingReactionIndex = discussion.reactions.findIndex(
      r => r.userId.toString() === req.user.id
    );

    if (existingReactionIndex > -1) {
      // Update existing reaction
      if (discussion.reactions[existingReactionIndex].type === type) {
        // Remove reaction if same type (toggle)
        discussion.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change reaction type
        discussion.reactions[existingReactionIndex].type = type;
      }
    } else {
      // Add new reaction
      discussion.reactions.push({
        userId: req.user.id,
        type
      });
    }

    await discussion.save();
    await discussion.populate('userId', 'nama email avatar');
    await discussion.populate('reactions.userId', 'nama avatar');

    res.json({
      success: true,
      data: { discussion }
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Reply to discussion
// @route   POST /api/discussions/:id/reply
// @access  Private
export const replyToDiscussion = async (req, res) => {
  try {
    const { konten } = req.body;

    if (!konten) {
      return res.status(400).json({
        success: false,
        message: 'Konten balasan wajib diisi'
      });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Diskusi tidak ditemukan'
      });
    }

    // Create comment
    const comment = await Comment.create({
      discussionId: discussion._id,
      userId: req.user.id,
      konten
    });

    // Add to discussion replies
    discussion.balasan.push(comment._id);
    await discussion.save();

    // Populate and return
    await comment.populate('userId', 'nama email avatar');

    res.status(201).json({
      success: true,
      data: { comment }
    });
  } catch (error) {
    console.error('Reply to discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get discussion statistics
// @route   GET /api/discussions/stats/:documentId
// @access  Private
export const getDiscussionStats = async (req, res) => {
  try {
    const { documentId } = req.params;

    // Check if document exists
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Get statistics
    const stats = await Discussion.aggregate([
      { $match: { dokumenId: document._id } },
      {
        $group: {
          _id: '$tipe',
          count: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const formattedStats = {
      total: 0,
      comment: 0,
      question: 0,
      suggestion: 0,
      issue: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    // Get total comments
    const totalComments = await Comment.countDocuments({
      discussionId: { $in: await Discussion.find({ dokumenId: documentId }).distinct('_id') }
    });

    formattedStats.totalComments = totalComments;

    res.json({
      success: true,
      data: { stats: formattedStats }
    });
  } catch (error) {
    console.error('Get discussion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Resolve discussion (mark as resolved)
// @route   PUT /api/discussions/:id/resolve
// @access  Private (Document owner or discussion author)
export const resolveDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Diskusi tidak ditemukan'
      });
    }

    // Get document to check ownership
    const document = await Document.findById(discussion.dokumenId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan'
      });
    }

    // Check if user can resolve
    const canResolve = 
      discussion.userId.toString() === req.user.id ||
      document.penulis.toString() === req.user.id;

    if (!canResolve) {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak dapat menyelesaikan diskusi ini'
      });
    }

    // Toggle resolved status
    discussion.isResolved = !discussion.isResolved;
    discussion.resolvedAt = discussion.isResolved ? new Date() : null;
    discussion.resolvedBy = discussion.isResolved ? req.user.id : null;

    await discussion.save();
    await discussion.populate('userId', 'nama email avatar');
    await discussion.populate('resolvedBy', 'nama email');

    res.json({
      success: true,
      data: { discussion }
    });
  } catch (error) {
    console.error('Resolve discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};