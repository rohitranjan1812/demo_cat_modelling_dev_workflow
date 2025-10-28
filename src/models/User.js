const mongoose = require('../config/mongoose-wrapper');
const bcrypt = require('bcrypt');

// User schema for authentication and authorization
const userSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        return /^USR-\d{8}$/.test(v);
      },
      message: 'User ID must be in format USR-XXXXXXXX'
    }
  },
  
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_-]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, underscores, and hyphens'
    }
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please provide a valid email address'
    }
  },
  
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        // Require at least one uppercase, one lowercase, one number, and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  
  // Profile Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  displayName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Role and Permissions
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Risk Manager', 'Analyst', 'Viewer', 'Service'],
    default: 'Viewer',
    index: true
  },
  
  permissions: [{
    type: String,
    enum: [
      // Read permissions
      'read_hazards', 'read_vulnerabilities', 'read_accounts', 'read_simulations', 'read_reports',
      // Write permissions  
      'write_hazards', 'write_vulnerabilities', 'write_accounts', 'write_simulations',
      // Management permissions
      'manage_users', 'manage_system', 'manage_data',
      // Admin permissions
      'admin', 'read_all', 'write_all'
    ]
  }],
  
  // Organization Information
  organization: {
    type: String,
    maxlength: 100
  },
  
  department: {
    type: String,
    maxlength: 100
  },
  
  jobTitle: {
    type: String,
    maxlength: 100
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
    default: 'Pending',
    index: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Security
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockoutUntil: {
    type: Date,
    default: null
  },
  
  // Session Management
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false }
  }],
  
  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ja']
    },
    
    timezone: {
      type: String,
      default: 'UTC'
    },
    
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'INR', 'BRL']
    },
    
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  
  // API Usage Tracking
  apiUsage: {
    requestsToday: { type: Number, default: 0 },
    requestsThisMonth: { type: Number, default: 0 },
    lastRequestAt: { type: Date, default: null },
    dailyLimit: { type: Number, default: 10000 },
    monthlyLimit: { type: Number, default: 300000 }
  },
  
  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Audit Trail
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'users'
});

// Indexes for performance
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ organization: 1, department: 1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ 'permissions': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lockout status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockoutUntil && this.lockoutUntil > Date.now());
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt rounds of 12
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    
    // Update password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to set display name
userSchema.pre('save', function(next) {
  if (!this.displayName) {
    this.displayName = this.fullName;
  }
  next();
});

// Instance method to check password
userSchema.methods.checkPassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate access token
userSchema.methods.generateAccessToken = function() {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'cat_modeling_platform_secret_2025';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      permissions: this.permissions
    },
    JWT_SECRET,
    { 
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'cat-modeling-platform',
      audience: 'cat-modeling-users'
    }
  );
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'cat_modeling_platform_secret_2025';
  
  const refreshToken = jwt.sign(
    { userId: this._id },
    JWT_SECRET + '_refresh',
    { 
      expiresIn: '30d',
      issuer: 'cat-modeling-platform'
    }
  );
  
  // Store refresh token
  this.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });
  
  return refreshToken;
};

// Instance method to revoke refresh token
userSchema.methods.revokeRefreshToken = function(token) {
  const tokenDoc = this.refreshTokens.find(rt => rt.token === token);
  if (tokenDoc) {
    tokenDoc.isRevoked = true;
  }
  return this.save();
};

// Instance method to clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(token => 
    token.expiresAt > now && !token.isRevoked
  );
  return this.save();
};

// Instance method to record login attempt
userSchema.methods.recordLoginAttempt = async function(successful) {
  if (successful) {
    // Reset failed attempts and update last login
    this.loginAttempts = 0;
    this.lockoutUntil = undefined;
    this.lastLoginAt = new Date();
    
    // Clean expired refresh tokens
    await this.cleanExpiredTokens();
  } else {
    // Increment failed attempts
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    
    // Lock account after 5 failed attempts for 15 minutes
    if (this.loginAttempts >= 5) {
      this.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
  }
  
  return this.save();
};

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === 'Admin') return true;
  if (this.permissions.includes('admin')) return true;
  return this.permissions.includes(permission);
};

// Instance method to check if user has role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), status: { $ne: 'Inactive' } });
};

// Static method to find by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username, status: { $ne: 'Inactive' } });
};

// Static method to create default admin user
userSchema.statics.createDefaultAdmin = async function() {
  const adminExists = await this.findOne({ role: 'Admin' });
  if (adminExists) return null;
  
  const admin = new this({
    userId: 'USR-00000001',
    username: 'admin',
    email: 'admin@catmodeling.com',
    password: 'CATModeling2025!',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'Admin',
    permissions: ['admin', 'read_all', 'write_all'],
    status: 'Active',
    isEmailVerified: true,
    organization: 'CAT Modeling Platform',
    department: 'System Administration',
    jobTitle: 'System Administrator'
  });
  
  await admin.save();
  console.log('✅ Default admin user created: admin@catmodeling.com / CATModeling2025!');
  return admin;
};

// Pre-save middleware for API usage tracking
userSchema.pre('save', function(next) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Reset daily counter if it's a new day
  if (!this.apiUsage.lastRequestAt || this.apiUsage.lastRequestAt < today) {
    this.apiUsage.requestsToday = 0;
  }
  
  // Reset monthly counter if it's a new month
  if (!this.apiUsage.lastRequestAt || this.apiUsage.lastRequestAt < thisMonth) {
    this.apiUsage.requestsThisMonth = 0;
  }
  
  next();
});

module.exports = mongoose.model('User', userSchema);
