import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  versi: {
    type: Number,
    required: true,
    min: 1
  },
  perubahan: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  konten: {
    type: String,
    required: true
  },
  editor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ukuranFile: {
    type: Number,
    default: 0
  },
  diff: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    device: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
versionSchema.index({ documentId: 1, versi: -1 });
versionSchema.index({ editor: 1, createdAt: -1 });

// Virtual for time elapsed
versionSchema.virtual('timeElapsed').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffMs = now - created;
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} hari yang lalu`;
  if (hours > 0) return `${hours} jam yang lalu`;
  if (minutes > 0) return `${minutes} menit yang lalu`;
  return 'Baru saja';
});

// Pre-save middleware to calculate file size
versionSchema.pre('save', function(next) {
  if (this.konten) {
    this.ukuranFile = Buffer.byteLength(this.konten, 'utf8');
  }
  next();
});

// Static method to get latest version
versionSchema.statics.getLatestVersion = async function(documentId) {
  return this.findOne({ documentId })
    .sort('-versi')
    .populate('editor', 'nama email')
    .exec();
};

// Static method to get version history
versionSchema.statics.getVersionHistory = async function(documentId, limit = 10) {
  return this.find({ documentId })
    .sort('-versi')
    .limit(limit)
    .populate('editor', 'nama email')
    .exec();
};

// Static method to restore version
versionSchema.statics.restoreVersion = async function(documentId, versionNumber, userId) {
  const version = await this.findOne({ documentId, versi: versionNumber });
  
  if (!version) {
    throw new Error('Version not found');
  }
  
  // Get latest version number
  const latestVersion = await this.findOne({ documentId })
    .sort('-versi')
    .select('versi');
  
  // Create new version as restoration
  const restoredVersion = new this({
    documentId,
    versi: latestVersion.versi + 1,
    perubahan: `Restored from version ${versionNumber}`,
    konten: version.konten,
    editor: userId,
    tags: version.tags
  });
  
  return restoredVersion.save();
};

// Instance method to compare with another version
versionSchema.methods.compareWith = async function(otherVersionId) {
  const otherVersion = await this.constructor.findById(otherVersionId);
  
  if (!otherVersion) {
    throw new Error('Version to compare not found');
  }
  
  // Simple comparison - could be enhanced with diff library
  return {
    sizeChange: this.ukuranFile - otherVersion.ukuranFile,
    timeGap: Math.abs(this.createdAt - otherVersion.createdAt),
    isSameEditor: this.editor.toString() === otherVersion.editor.toString()
  };
};

// Transform output
versionSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Version = mongoose.model('Version', versionSchema);

export default Version;