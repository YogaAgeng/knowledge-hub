import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 500
  },
  content: {
    type: String,
    maxlength: 50000
  },
  type: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx', 'image', 'other']
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studyGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    default: null
  },
  sharedSettings: {
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: Date
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['tugas', 'materi', 'catatan', 'presentasi', 'laporan', 'ujian', 'referensi', 'other'],
    default: 'other'
  },
  subject: {
    type: String,
    trim: true
  },
  semester: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['upload', 'google-drive', 'notion', 'onenote'],
    default: 'upload'
  },
  sourceId: {
    type: String // ID from external platform
  },
  lastSynced: {
    type: Date,
    default: Date.now
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  metadata: {
    pages: Number,
    words: Number,
    author: String,
    createdDate: Date,
    modifiedDate: Date
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  version: {
    type: Number,
    default: 1
  },
  versions: [{
    version: Number,
    fileUrl: String,
    fileSize: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: Date,
    changes: String
  }]
}, {
  timestamps: true
});

// Indexes
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ studyGroup: 1, createdAt: -1 });
documentSchema.index({ tags: 1 });
documentSchema.index({ title: 'text', description: 'text', content: 'text' });
documentSchema.index({ subject: 1, semester: 1 });
documentSchema.index({ category: 1 });

// Virtual for discussion count
documentSchema.virtual('discussionCount', {
  ref: 'Discussion',
  localField: '_id',
  foreignField: 'document',
  count: true
});

// Methods
documentSchema.methods.incrementView = async function(userId) {
  // Don't count owner's views
  if (this.userId.toString() !== userId.toString()) {
    this.viewCount += 1;
    this.lastActivity = new Date();
    await this.save();
  }
};

documentSchema.methods.incrementDownload = async function(userId) {
  this.downloadCount += 1;
  if (this.userId.toString() !== userId.toString()) {
    this.lastActivity = new Date();
  }
  await this.save();
};

documentSchema.methods.addCollaborator = async function(userId, permission = 'view') {
  const existingCollab = this.collaborators.find(
    c => c.user.toString() === userId.toString()
  );

  if (!existingCollab) {
    this.collaborators.push({
      user: userId,
      permission,
      addedAt: new Date()
    });
    await this.save();
  }
};

documentSchema.methods.updateVersion = async function(fileUrl, fileSize, userId, changes) {
  this.version += 1;
  this.versions.push({
    version: this.version,
    fileUrl: this.fileUrl, // Save old version
    fileSize: this.fileSize,
    uploadedBy: userId,
    uploadedAt: new Date(),
    changes
  });
  
  // Update to new version
  this.fileUrl = fileUrl;
  this.fileSize = fileSize;
  this.lastActivity = new Date();
  
  await this.save();
};

// Statics
documentSchema.statics.getByStudyGroup = async function(studyGroupId, options = {}) {
  const {
    page = 1,
    limit = 20,
    sortBy = '-createdAt',
    category,
    tags
  } = options;

  const query = { studyGroup: studyGroupId };
  
  if (category) {
    query.category = category;
  }
  
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }

  const documents = await this.find(query)
    .populate('userId', 'nama email profilePicture')
    .populate('sharedSettings.sharedBy', 'nama email')
    .sort(sortBy)
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(query);

  return {
    documents,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocuments: total,
      hasNext: page * limit < total
    }
  };
};

documentSchema.statics.searchDocuments = async function(userId, searchQuery, options = {}) {
  const {
    page = 1,
    limit = 20,
    includeShared = true,
    studyGroupId
  } = options;

  // Build search query
  const query = {
    $and: [
      {
        $or: [
          { userId }, // User's own documents
          ...(includeShared ? [
            { 'collaborators.user': userId }, // Documents shared with user
            { studyGroup: { $ne: null } } // Documents in study groups
          ] : [])
        ]
      }
    ]
  };

  // Add text search
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }

  // Filter by study group if specified
  if (studyGroupId) {
    query.studyGroup = studyGroupId;
  }

  // Execute search
  const documents = await this.find(query)
    .populate('userId', 'nama email')
    .populate('studyGroup', 'name')
    .sort('-lastActivity')
    .limit(limit)
    .skip((page - 1) * limit);

  const total = await this.countDocuments(query);

  return {
    documents,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      hasNext: page * limit < total
    }
  };
};

// Auto-categorize based on title
documentSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    const title = this.title.toLowerCase();
    
    if (title.includes('tugas') || title.includes('assignment')) {
      this.category = 'tugas';
    } else if (title.includes('materi') || title.includes('modul')) {
      this.category = 'materi';
    } else if (title.includes('catatan') || title.includes('notes')) {
      this.category = 'catatan';
    } else if (title.includes('presentasi') || title.includes('ppt')) {
      this.category = 'presentasi';
    } else if (title.includes('laporan') || title.includes('report')) {
      this.category = 'laporan';
    } else if (title.includes('uts') || title.includes('uas') || title.includes('ujian')) {
      this.category = 'ujian';
    }

    // Auto-tag based on common patterns
    const autoTags = [];
    if (title.includes('uts')) autoTags.push('uts');
    if (title.includes('uas')) autoTags.push('uas');
    if (title.includes('quiz')) autoTags.push('quiz');
    if (title.includes('praktikum')) autoTags.push('praktikum');
    
    // Merge with existing tags
    this.tags = [...new Set([...this.tags, ...autoTags])];
  }
  
  next();
});

export default mongoose.model('Document', documentSchema);