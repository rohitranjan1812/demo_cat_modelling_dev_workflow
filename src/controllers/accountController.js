const Account = require('../models/Account');
const { accountSchema, accountUpdateSchema, querySchema } = require('../validation/schemas');

class AccountController {
  // Create a new account
  static async createAccount(req, res) {
    try {
      const { error, value } = accountSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      // Check if account ID already exists
      const existingAccount = await Account.findOne({ accountId: value.accountId });
      if (existingAccount) {
        return res.status(409).json({
          success: false,
          message: 'Account ID already exists'
        });
      }

      // Validate parent account exists if specified
      if (value.parentAccountId) {
        const parentAccount = await Account.findOne({ accountId: value.parentAccountId });
        if (!parentAccount) {
          return res.status(400).json({
            success: false,
            message: 'Parent account not found'
          });
        }
        
        // Set account level based on parent
        value.accountLevel = parentAccount.accountLevel + 1;
      }

      const account = new Account(value);
      await account.save();

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: account
      });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get all accounts with pagination and filtering
  static async getAccounts(req, res) {
    try {
      const { error, value } = querySchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { page, limit, sort, order, status, search } = value;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter = {};
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { accountName: { $regex: search, $options: 'i' } },
          { accountId: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sortObj = {};
      sortObj[sort] = order === 'asc' ? 1 : -1;

      const accounts = await Account.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('parentAccountId', 'accountId accountName');

      const total = await Account.countDocuments(filter);

      res.json({
        success: true,
        data: accounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get account by ID
  static async getAccountById(req, res) {
    try {
      const { accountId } = req.params;

      const account = await Account.findOne({ accountId })
        .populate('parentAccountId', 'accountId accountName');

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      res.json({
        success: true,
        data: account
      });
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update account
  static async updateAccount(req, res) {
    try {
      const { accountId } = req.params;
      const { error, value } = accountUpdateSchema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message)
        });
      }

      const account = await Account.findOne({ accountId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Validate parent account exists if being changed
      if (value.parentAccountId && value.parentAccountId !== account.parentAccountId) {
        const parentAccount = await Account.findOne({ accountId: value.parentAccountId });
        if (!parentAccount) {
          return res.status(400).json({
            success: false,
            message: 'Parent account not found'
          });
        }
        
        // Update account level based on new parent
        value.accountLevel = parentAccount.accountLevel + 1;
      }

      const updatedAccount = await Account.findOneAndUpdate(
        { accountId },
        { ...value, lastModifiedBy: req.user?.id || 'system' },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: 'Account updated successfully',
        data: updatedAccount
      });
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete account
  static async deleteAccount(req, res) {
    try {
      const { accountId } = req.params;

      const account = await Account.findOne({ accountId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      // Check if account has child accounts
      const childAccounts = await Account.find({ parentAccountId: accountId });
      if (childAccounts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete account with child accounts',
          childAccounts: childAccounts.map(child => child.accountId)
        });
      }

      await Account.findOneAndDelete({ accountId });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get child accounts
  static async getChildAccounts(req, res) {
    try {
      const { accountId } = req.params;

      const account = await Account.findOne({ accountId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const childAccounts = await account.getChildAccounts();

      res.json({
        success: true,
        data: childAccounts
      });
    } catch (error) {
      console.error('Error fetching child accounts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get total exposure including children
  static async getTotalExposure(req, res) {
    try {
      const { accountId } = req.params;

      const account = await Account.findOne({ accountId });
      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found'
        });
      }

      const totalExposure = await account.getTotalExposureIncludingChildren();

      res.json({
        success: true,
        data: {
          accountId: account.accountId,
          accountName: account.accountName,
          directExposure: account.totalExposure,
          totalExposureIncludingChildren: totalExposure,
          currency: account.currency
        }
      });
    } catch (error) {
      console.error('Error calculating total exposure:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get accounts by region
  static async getAccountsByRegion(req, res) {
    try {
      const { region } = req.params;
      const { error, value } = querySchema.validate(req.query);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: error.details.map(detail => detail.message)
        });
      }

      const { page, limit, sort, order } = value;
      const skip = (page - 1) * limit;

      const sortObj = {};
      sortObj[sort] = order === 'asc' ? 1 : -1;

      const accounts = await Account.findByRegion(region)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate('parentAccountId', 'accountId accountName');

      const total = await Account.findByRegion(region).countDocuments();

      res.json({
        success: true,
        data: accounts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching accounts by region:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = AccountController;
