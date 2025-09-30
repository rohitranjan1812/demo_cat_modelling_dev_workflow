const express = require('express');
const AccountController = require('../controllers/accountController');

const router = express.Router();

// Account routes
// IMPORTANT: Specific routes MUST come before parametrized routes (:accountId)

// Region-specific routes (before :accountId routes)
router.get('/region/:region', AccountController.getAccountsByRegion);

// Base CRUD operations
router.post('/', AccountController.createAccount);
router.get('/', AccountController.getAccounts);

// Account-specific routes with :accountId (after specific routes)
router.get('/:accountId/children', AccountController.getChildAccounts);
router.get('/:accountId/total-exposure', AccountController.getTotalExposure);
router.get('/:accountId', AccountController.getAccountById);
router.put('/:accountId', AccountController.updateAccount);
router.delete('/:accountId', AccountController.deleteAccount);

module.exports = router;
