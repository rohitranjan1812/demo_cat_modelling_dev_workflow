const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { 
  authenticateToken, 
  optionalAuth, 
  rateLimit, 
  generateToken, 
  generateRefreshToken,
  verifyToken
} = require('../middleware/authMiddleware');

/**
 * User Registration
 * POST /api/v1/auth/register
 */
router.post('/register', rateLimit(20, 15 * 60 * 1000), async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      organization,
      department,
      jobTitle
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email or username',
        errorCode: 'USER_EXISTS'
      });
    }

    // Generate user ID
    const userCount = await User.countDocuments();
    const userId = `USR-${(userCount + 1).toString().padStart(8, '0')}`;

    // Create new user
    const user = new User({
      userId,
      username,
      email,
      password,
      firstName,
      lastName,
      organization,
      department,
      jobTitle,
      role: 'Viewer', // Default role
      permissions: ['read_hazards', 'read_vulnerabilities', 'read_simulations'],
      status: 'Active' // In production, this would be 'Pending' until email verification
    });

    await user.save();

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.save(); // Save refresh token

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
          status: user.status
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '7d'
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
      errorCode: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * User Login
 * POST /api/v1/auth/login
 */
router.post('/login', rateLimit(50, 15 * 60 * 1000), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        errorCode: 'MISSING_CREDENTIALS'
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username.toLowerCase() }],
      status: { $ne: 'Inactive' }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockoutMinutes = Math.ceil((user.lockoutUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        message: `Account is locked. Try again in ${lockoutMinutes} minutes.`,
        errorCode: 'ACCOUNT_LOCKED',
        lockoutUntil: user.lockoutUntil
      });
    }

    // Check password
    const isPasswordValid = await user.checkPassword(password);
    
    if (!isPasswordValid) {
      await user.recordLoginAttempt(false);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        errorCode: 'INVALID_CREDENTIALS',
        remainingAttempts: Math.max(0, 5 - user.loginAttempts)
      });
    }

    // Check if user is suspended or pending
    if (user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Contact administrator.',
        errorCode: 'ACCOUNT_SUSPENDED'
      });
    }

    if (user.status === 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Account is pending approval. Contact administrator.',
        errorCode: 'ACCOUNT_PENDING'
      });
    }

    // Successful login
    await user.recordLoginAttempt(true);
    
    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    await user.save(); // Save refresh token

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions: user.permissions,
          status: user.status,
          organization: user.organization,
          preferences: user.preferences
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: '7d'
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
      errorCode: 'LOGIN_ERROR'
    });
  }
});

/**
 * Token Refresh
 * POST /api/v1/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        errorCode: 'NO_REFRESH_TOKEN'
      });
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_SECRET + '_refresh');
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
        errorCode: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Check if refresh token is valid and not revoked
    const storedToken = user.refreshTokens.find(rt => 
      rt.token === refreshToken && !rt.isRevoked && rt.expiresAt > new Date()
    );

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is invalid or expired',
        errorCode: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    // Generate new tokens
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();
    
    // Revoke old refresh token
    storedToken.isRevoked = true;
    
    await user.save();

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: '7d'
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      errorCode: 'TOKEN_REFRESH_ERROR'
    });
  }
});

/**
 * User Logout
 * POST /api/v1/auth/logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      // Revoke specific refresh token
      await user.revokeRefreshToken(refreshToken);
    } else {
      // Revoke all refresh tokens for this user
      user.refreshTokens.forEach(token => {
        token.isRevoked = true;
      });
      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      errorCode: 'LOGOUT_ERROR'
    });
  }
});

/**
 * Get Current User Profile
 * GET /api/v1/auth/profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions,
          status: user.status,
          organization: user.organization,
          department: user.department,
          jobTitle: user.jobTitle,
          preferences: user.preferences,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      errorCode: 'PROFILE_ERROR'
    });
  }
});

/**
 * Update User Profile
 * PUT /api/v1/auth/profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

    // Only allow certain fields to be updated by the user
    const allowedUpdates = [
      'firstName', 'lastName', 'displayName', 'organization', 
      'department', 'jobTitle', 'preferences'
    ];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
      errorCode: 'PROFILE_UPDATE_ERROR'
    });
  }
});

/**
 * Change Password
 * PUT /api/v1/auth/password
 */
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
        errorCode: 'MISSING_PASSWORDS'
      });
    }

    // Check current password
    const isCurrentPasswordValid = await user.checkPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
        errorCode: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all existing refresh tokens
    user.refreshTokens.forEach(token => {
      token.isRevoked = true;
    });
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again with new password.'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(400).json({
      success: false,
      message: 'Password change failed',
      error: error.message,
      errorCode: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

/**
 * Verify Token (for frontend validation)
 * GET /api/v1/auth/verify
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions,
        status: req.user.status
      },
      tokenInfo: {
        issuedAt: new Date(req.tokenPayload.iat * 1000),
        expiresAt: new Date(req.tokenPayload.exp * 1000),
        issuer: req.tokenPayload.iss,
        audience: req.tokenPayload.aud
      }
    }
  });
});

/**
 * Get User Permissions
 * GET /api/v1/auth/permissions
 */
router.get('/permissions', authenticateToken, (req, res) => {
  const user = req.user;
  
  res.json({
    success: true,
    data: {
      permissions: user.permissions,
      role: user.role,
      canRead: {
        hazards: user.hasPermission('read_hazards'),
        vulnerabilities: user.hasPermission('read_vulnerabilities'),
        accounts: user.hasPermission('read_accounts'),
        simulations: user.hasPermission('read_simulations'),
        reports: user.hasPermission('read_reports')
      },
      canWrite: {
        hazards: user.hasPermission('write_hazards'),
        vulnerabilities: user.hasPermission('write_vulnerabilities'),
        accounts: user.hasPermission('write_accounts'),
        simulations: user.hasPermission('write_simulations')
      },
      canManage: {
        users: user.hasPermission('manage_users'),
        system: user.hasPermission('manage_system'),
        data: user.hasPermission('manage_data')
      },
      isAdmin: user.role === 'Admin'
    }
  });
});

/**
 * Revoke All Sessions
 * POST /api/v1/auth/revoke-sessions
 */
router.post('/revoke-sessions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Revoke all refresh tokens
    user.refreshTokens.forEach(token => {
      token.isRevoked = true;
    });
    
    await user.save();

    res.json({
      success: true,
      message: 'All sessions have been revoked. Please login again.'
    });

  } catch (error) {
    console.error('Session revocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions',
      errorCode: 'SESSION_REVOCATION_ERROR'
    });
  }
});

/**
 * Get User Sessions
 * GET /api/v1/auth/sessions
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const activeSessions = user.refreshTokens
      .filter(token => !token.isRevoked && token.expiresAt > new Date())
      .map(token => ({
        id: token._id,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        isActive: true
      }));

    res.json({
      success: true,
      data: {
        activeSessions: activeSessions.length,
        sessions: activeSessions,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Sessions retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sessions',
      errorCode: 'SESSIONS_ERROR'
    });
  }
});

/**
 * Request Password Reset
 * POST /api/v1/auth/forgot-password
 */
router.post('/forgot-password', rateLimit(3, 60 * 60 * 1000), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        errorCode: 'MISSING_EMAIL'
      });
    }

    const user = await User.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // In production, generate reset token and send email
    // For now, just return success
    console.log(`Password reset requested for user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset request failed',
      errorCode: 'PASSWORD_RESET_ERROR'
    });
  }
});

/**
 * Health Check for Auth Service
 * GET /api/v1/auth/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Authentication Service',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
