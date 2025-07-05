import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama harus diisi'],
    trim: true,
    maxlength: [100, 'Nama maksimal 100 karakter']
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Format email tidak valid'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: [8, 'Password minimal 8 karakter'],
    select: false // Don't include password in queries by default
  },
  jurusan: {
    type: String,
    required: [true, 'Jurusan harus diisi'],
    trim: true,
    maxlength: [100, 'Jurusan maksimal 100 karakter']
  },
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio maksimal 500 karakter']
    },
    avatar: {
      type: String,
      default: null
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      language: {
        type: String,
        enum: ['id', 'en'],
        default: 'id'
      }
    }
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  integrations: {
    googleDrive: {
      connected: { type: Boolean, default: false },
      accessToken: { type: String, select: false },
      refreshToken: { type: String, select: false },
      connectedAt: Date,
      disconnectedAt: Date
    },
    notion: {
      connected: { type: Boolean, default: false },
      apiKey: { type: String, select: false },
      connectedAt: Date,
      disconnectedAt: Date
    },
    oneNote: {
      connected: { type: Boolean, default: false },
      accessToken: { type: String, select: false },
      refreshToken: { type: String, select: false },
      connectedAt: Date,
      disconnectedAt: Date
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    nama: this.nama,
    email: this.email,
    jurusan: this.jurusan,
    profile: this.profile,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt
  };
});

// Instance method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

export default mongoose.model('User', userSchema);