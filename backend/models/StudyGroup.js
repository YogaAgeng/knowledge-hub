import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Study group name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  joinCode: {
    type: String,
    sparse: true,
    unique: true
  },
  joinCodeExpiry: {
    type: Date
  },
  settings: {
    maxMembers: {
      type: Number,
      default: 10,
      min: 2,
      max: 10
    },
    allowMemberInvite: {
      type: Boolean,
      default: false
    },
    documentSharingPermission: {
      type: String,
      enum: ['all', 'admin', 'owner'],
      default: 'all'
    }
  },
  activities: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    action: {
      type: String,
      enum: ['joined', 'left', 'shared_document', 'commented', 'removed_document', 'updated_settings']
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalDocuments: {
      type: Number,
      default: 0
    },
    totalDiscussions: {
      type: Number,
      default: 0
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  academicYear: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
studyGroupSchema.index({ owner: 1, createdAt: -1 });
studyGroupSchema.index({ 'members.user': 1 });
studyGroupSchema.index({ subject: 1, semester: 1 });
studyGroupSchema.index({ joinCode: 1 });
studyGroupSchema.index({ name: 'text', description: 'text' });

// Generate join code for private groups
studyGroupSchema.pre('save', async function(next) {
  if (this.isPrivate && !this.joinCode) {
    this.joinCode = await this.generateUniqueJoinCode();
    this.joinCodeExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Methods
studyGroupSchema.methods.generateUniqueJoinCode = async function() {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existing = await this.constructor.findOne({ joinCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

studyGroupSchema.methods.regenerateJoinCode = async function() {
  if (!this.isPrivate) {
    throw new Error('Join codes are only for private groups');
  }
  
  this.joinCode = await this.generateUniqueJoinCode();
  this.joinCodeExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return this.save();
};

studyGroupSchema.methods.addActivity = async function(userId, action, metadata = {}) {
  this.activities.push({
    user: userId,
    action,
    metadata,
    timestamp: new Date()
  });
  
  if (this.activities.length > 100) {
    this.activities = this.activities.slice(-100);
  }
  
  this.stats.lastActivityAt = new Date();
  return this.save();
};

studyGroupSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

studyGroupSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(m => 
    m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

studyGroupSchema.methods.addMember = async function(userId, role = 'member') {
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Study group is full');
  }
  
  if (this.isMember(userId)) {
    throw new Error('User is already a member');
  }
  
  this.members.push({
    user: userId,
    role,
    joinedAt: new Date()
  });
  
  return this.save();
};

studyGroupSchema.methods.removeMember = async function(userId) {
  const memberIndex = this.members.findIndex(m => 
    m.user.toString() === userId.toString()
  );
  
  if (memberIndex === -1) {
    throw new Error('User is not a member');
  }
  
  const member = this.members[memberIndex];
  
  if (member.role === 'owner') {
    throw new Error('Cannot remove owner from group');
  }
  
  this.members.splice(memberIndex, 1);
  return this.save();
};

studyGroupSchema.methods.updateMemberRole = async function(userId, newRole) {
  const member = this.members.find(m => 
    m.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member');
  }
  
  if (member.role === 'owner' && newRole !== 'owner') {
    const ownerCount = this.members.filter(m => m.role === 'owner').length;
    if (ownerCount === 1) {
      throw new Error('Group must have at least one owner');
    }
  }
  
  member.role = newRole;
  return this.save();
};

studyGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

studyGroupSchema.set('toJSON', { virtuals: true });

export default mongoose.model('StudyGroup', studyGroupSchema);