// models/User.js
const userSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  jurusan: {
    type: String,
    required: true
  },
  googleDriveTokens: {
    accessToken: String,
    refreshToken: String,
    expiry_date: Number
  },
  googleDriveConnected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});