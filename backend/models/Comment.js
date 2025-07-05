import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },
  // Simplified status - just resolved or not
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  editedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
commentSchema.index({ documentId: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ resolved: 1 });

// Simplified methods for MVP
commentSchema.methods.canEdit = function(userId) {
  return this.user.toString() === userId.toString() && !this.resolved;
};

commentSchema.methods.canDelete = function(userId, documentOwnerId) {
  // Comment author or document owner can delete
  return this.user.toString() === userId.toString() || 
         documentOwnerId.toString() === userId.toString();
};

commentSchema.methods.canResolve = function(userId, documentOwnerId) {
  // Document owner or comment author can resolve
  return documentOwnerId.toString() === userId.toString() || 
         this.user.toString() === userId.toString();
};

commentSchema.methods.resolve = function(userId) {
  this.resolved = true;
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  return this.save();
};

commentSchema.methods.unresolve = function() {
  this.resolved = false;
  this.resolvedBy = null;
  this.resolvedAt = null;
  return this.save();
};

// Static method to get comments with user info
commentSchema.statics.getDocumentComments = function(documentId, options = {}) {
  const { page = 1, limit = 20, resolved } = options;
  
  const filter = { documentId };
  if (resolved !== undefined) {
    filter.resolved = resolved === 'true';
  }

  const skip = (page - 1) * limit;

  return this.find(filter)
    .populate('user', 'nama email jurusan')
    .populate('resolvedBy', 'nama')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
};

// Static method to get comment stats
commentSchema.statics.getStats = function(documentId) {
  return this.aggregate([
    { $match: { documentId: new mongoose.Types.ObjectId(documentId) } },
    {
      $group: {
        _id: null,
        totalComments: { $sum: 1 },
        resolvedComments: {
          $sum: { $cond: [{ $eq: ['$resolved', true] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalComments: 1,
        resolvedComments: 1,
        pendingComments: { $subtract: ['$totalComments', '$resolvedComments'] }
      }
    }
  ]);
};

export default mongoose.model('Comment', commentSchema);