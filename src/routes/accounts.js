const express = require('express');
const AccountController = require('../controllers/accountController');

const router = express.Router();

// Account routes
router.post('/', AccountController.createAccount);
router.get('/', AccountController.getAccounts);
router.get('/:accountId', AccountController.getAccountById);
router.put('/:accountId', AccountController.updateAccount);
router.delete('/:accountId', AccountController.deleteAccount);

// Account-specific routes
router.get('/:accountId/children', AccountController.getChildAccounts);
router.get('/:accountId/total-exposure', AccountController.getTotalExposure);
router.get('/region/:region', AccountController.getAccountsByRegion);

module.exports = router;
