const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const transactionsController = require('./transactions-controller');
const transactionsValidator = require('./transactions-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/transactions', route);

  // Get transaction history for specific user with optional filters
  route.get(
    '/:country_id/history',
    authenticationMiddleware,
    celebrate(transactionsValidator.getTransactionHistory),
    transactionsController.getTransactionHistory
  );

  // Get recent transactions (last 5) for a user
  route.get(
    '/:country_id/recent',
    authenticationMiddleware,
    celebrate(transactionsValidator.getRecentTransactions),
    transactionsController.getRecentTransactions
  );

  // Get transaction summary for a user
  route.get(
    '/:country_id/summary',
    authenticationMiddleware,
    celebrate(transactionsValidator.getTransactionSummary),
    transactionsController.getTransactionSummary
  );

  // Get specific transaction by ID
  route.get(
    '/detail/:transaction_id',
    authenticationMiddleware,
    celebrate(transactionsValidator.getTransactionById),
    transactionsController.getTransactionById
  );
};
