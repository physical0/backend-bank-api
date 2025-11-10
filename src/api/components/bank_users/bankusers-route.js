const express = require('express');
const celebrate = require('../../../core/celebrate-wrappers');
const authenticationMiddleware = require('../../middlewares/authentication-middleware');

const bankUsersController = require('./bankusers-controller');
const bankUsersValidator = require('./bankusers-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/bank', route);

  // Get list of bank accounts
  route.get('/', authenticationMiddleware, bankUsersController.getAllBankAcc);

  // Get bank account
  route.get(
    '/:country_id',
    authenticationMiddleware,
    bankUsersController.getBankAcc
  );

  // Create bank account
  route.post(
    '/create-acc',
    authenticationMiddleware,
    celebrate(bankUsersValidator.createBankAcc),
    bankUsersController.createBankAcc
  );

  // Delete bank account
  route.delete(
    '/delete-acc/:country_id',
    authenticationMiddleware,
    celebrate(bankUsersValidator.deleteBankAcc),
    bankUsersController.deleteBankAcc
  );

  // Update bank account balance by money insertion
  route.put(
    '/:country_id/deposit',
    authenticationMiddleware,
    celebrate(bankUsersValidator.depositMoney),
    bankUsersController.depositMoney
  );

  // Update bank account balance by money retrieval
  route.put(
    '/:country_id/retrieve',
    authenticationMiddleware,
    celebrate(bankUsersValidator.retrieveMoney),
    bankUsersController.retrieveMoney
  );

  // Lock bank account
  route.put(
    '/:country_id/lock',
    authenticationMiddleware,
    celebrate(bankUsersValidator.lockAccount),
    bankUsersController.lockAccount
  );

  // Unlock bank account
  route.put(
    '/:country_id/unlock',
    authenticationMiddleware,
    celebrate(bankUsersValidator.unlockAccount),
    bankUsersController.unlockAccount
  );

  // Check account status (including lock status)
  route.get(
    '/:country_id/status',
    authenticationMiddleware,
    celebrate(bankUsersValidator.getAccountStatus),
    bankUsersController.getAccountStatus
  );
};
