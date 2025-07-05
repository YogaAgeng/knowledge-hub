import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  studyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentDiscussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion',
    default: null
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'helpful', 'insightful', 'question']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
discussionSchema.index({ document: 1, createdAt: -1 });
discussionSchema.index({ studyGroup: 1, author: 1 });
discussionSchema.index({ parentDiscussion: 1 });

// Virtual for reply count
discussionSchema.virtual('replyCount', {
  ref: 'Discussion',
  localField: '_id',
  foreignField: 'parentDiscussion',
  count: true
});

// Pre-populate hook
discussionSchema.pre(/^find/, function() {
  this.populate('author', 'nama email profilePicture');
});

// Methods
discussionSchema.methods.addReaction = async function(userId, reactionType) {
  const existingReaction = this.reactions.find(
    r => r.user.toString() === userId.toString()
  );

  if (existingReaction) {
    if (existingReaction.type === reactionType) {
      // Remove reaction if same type
      this.reactions = this.reactions.filter(
        r => r.user.toString() !== userId.toString()
      );
    } else {
      // Update reaction type
      existingReaction.type = reactionType;
    }
  } else {
    // Add new reaction
    this.reactions.push({
      user: userId,
      type: reactionType
    });
  }

  return this.save();
};

discussionSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.content = '[This comment has been deleted]';
  this.attachments = [];
  return this.save();
};

// Statics
discussionSchema.statics.getDiscussionThread = async function(documentId, options = {}) {
  const { limit = 20, skip = 0, sortBy = '-createdAt' } = options;

  // Get parent discussions
  const discussions = await this.find({
    document: documentId,
    parentDiscussion: null,
    isDeleted: false
  })
    .sort(sortBy)
    .limit(limit)
    .skip(skip)
    .populate('replyCount');

  // Get replies for each discussion
  const discussionsWithReplies = await Promise.all(
    discussions.map(async (discussion) => {
      const replies = await this.find({
        parentDiscussion: discussion._id,
        isDeleted: false
      })
        .sort('createdAt')
        .limit(5);

      return {
        ...discussion.toObject(),
        replies,
        hasMoreReplies: discussion.replyCount > 5
      };
    })
  );

  return discussionsWithReplies;
};

export default mongoose.model('Discussion', discussionSchema);