const mongoose = require('mongoose');
const User = require('../../src/models/User');

/**
 * Test suite for User Model - Core Model Layer
 * Tests user authentication and authorization data model
 * Priority: P0 (Core Model - Foundation)
 */
describe('User Model - Core Model Tests', () => {

  beforeEach(async () => {
    // Clear the collection before each test
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    describe('Unique Constraints', () => {
      test('should enforce unique userId', async () => {
        const userData1 = {
          userId: 'USR-12345678',
          username: 'testuser1' + Date.now(),
          email: 'test1@example.com',
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe'
        };

        const userData2 = {
          userId: 'USR-12345678', // Same userId
          username: 'testuser2' + Date.now(),
          email: 'different@example.com', 
          password: 'SecurePassword123!',
          firstName: 'Jane',
          lastName: 'Doe'
        };

        const user1 = new User(userData1);
        await user1.save();

        const user2 = new User(userData2);
        await expect(user2.save()).rejects.toThrow();

        await user1.deleteOne();
      });

      test('should enforce unique username', async () => {
        const userData1 = {
          userId: 'USR-12345678',
          username: 'uniqueuser',
          email: 'test1@example.com',
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe'
        };

        const userData2 = {
          userId: 'USR-' + Math.floor(Math.random() * 100000000),
          username: 'uniqueuser', // Same username
          email: 'different@example.com',
          password: 'SecurePassword123!',
          firstName: 'Jane',
          lastName: 'Doe'
        };

        const user1 = new User(userData1);
        await user1.save();

        const user2 = new User(userData2);
        await expect(user2.save()).rejects.toThrow();

        await user1.deleteOne();
      });

      test('should enforce unique email', async () => {
        const userData1 = {
          userId: 'USR-12345678',
          username: 'testuser1' + Date.now(),
          email: 'unique@example.com',  
          password: 'SecurePassword123!',
          firstName: 'John',
          lastName: 'Doe'
        };

        const userData2 = {
          userId: 'USR-' + Math.floor(Math.random() * 100000000),
          username: 'differentuser',
          email: 'unique@example.com', // Same email
          password: 'SecurePassword123!',
          firstName: 'Jane',
          lastName: 'Doe'
        };

        const user1 = new User(userData1);
        await user1.save();

        const user2 = new User(userData2);
        await expect(user2.save()).rejects.toThrow();

        await user1.deleteOne();
      });
    });

    test('should create a valid user', async () => {
      const userData = {
        userId: 'USR-12345678',
        username: 'testuser' + Date.now(),
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.userId).toBe(userData.userId);
      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.status).toBe('Pending'); // Default value
      expect(savedUser.role).toBe('Viewer'); // Default value
    });

    test('should fail with invalid userId format', async () => {
      const userData = {
        userId: 'INVALID-ID',
        username: 'testuser' + Date.now(),
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should fail with invalid email format', async () => {
      const userData = {
        userId: 'USR-12345678', 
        username: 'testuser' + Date.now(),
        email: 'invalid-email',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Model Methods', () => {
    test('should check password correctly', async () => {
      const userData = {
        userId: 'USR-12345678',
        username: 'testuser' + Date.now(),
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await user.save();

      expect(await user.checkPassword('SecurePassword123!')).toBe(true);
      expect(await user.checkPassword('WrongPassword')).toBe(false);
    });

    test('should check if user has permission', async () => {
      const userData = {
        userId: 'USR-12345678',
        username: 'testuser' + Date.now(),
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe',
        permissions: ['read_hazards', 'write_vulnerabilities']
      };

      const user = new User(userData);
      await user.save();

      expect(user.hasPermission('read_hazards')).toBe(true);
      expect(user.hasPermission('admin_users')).toBe(false);
    });

    test('should generate access token', async () => {
      const userData = {
        userId: 'USR-12345678',
        username: 'testuser' + Date.now(),
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await user.save();

      const token = user.generateAccessToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('Password Management', () => {
    test('should hash password before saving', async () => {
      const userData = {
        userId: 'USR-12345678',
        username: 'testuser' + Date.now(),
        email: 'test@example.com',
        password: 'SecurePassword123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('SecurePassword123!');
      expect(user.password).toMatch(/^\$2b\$/); // bcrypt hash pattern
    });
  });
});