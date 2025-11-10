const transactionsRepository = require('./transactions-repository');
const transactionFilters = require('../../../utils/transaction-filters');
const { v4: uuidv4 } = require('uuid');

/**
 * Record a new transaction
 * @param {string} country_id - Country ID
 * @param {string} transaction_type - Type of transaction
 * @param {number} amount - Transaction amount
 * @param {number} balance_before - Balance before transaction
 * @param {number} balance_after - Balance after transaction
 * @param {string} description - Transaction description
 * @param {string} recipient_country_id - Recipient for transfers (optional)
 * @returns {Promise}
 */
async function recordTransaction(
  country_id,
  transaction_type,
  amount,
  balance_before,
  balance_after,
  description,
  recipient_country_id = null
) {
  const transactionData = {
    transaction_id: uuidv4(),
    country_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    recipient_country_id,
    transaction_status: 'completed',
  };

  return await transactionsRepository.createTransaction(transactionData);
}

/**
 * Get transaction history for a user
 * @param {string} country_id - Country ID
 * @param {object} filters - Optional filters (startDate, endDate, transaction_type)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of transactions per page
 * @returns {Promise}
 */
async function getTransactionHistory(
  country_id,
  filters = {},
  page = 1,
  limit = 10
) {
  try {
    let transactions;

    // Get transactions based on whether date range is specified
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      transactions = await transactionsRepository.getTransactionsByDateRange(
        country_id,
        startDate,
        endDate
      );
    } else {
      transactions =
        await transactionsRepository.getTransactionsByCountryId(country_id);
    }

    // Apply filters using the utility
    const filteredTransactions = transactionFilters.applyFilters(
      transactions,
      filters
    );

    // Sort transactions by date (most recent first)
    const sortedTransactions = transactionFilters.sortByDate(
      filteredTransactions,
      'desc'
    );

    // Apply pagination
    return transactionFilters.applyPagination(sortedTransactions, page, limit);
  } catch (error) {
    return null;
  }
}

/**
 * Get recent transactions for a user (last 5)
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function getRecentTransactions(country_id) {
  try {
    return await transactionsRepository.getRecentTransactions(country_id);
  } catch (error) {
    return null;
  }
}

/**
 * Get transaction by ID
 * @param {string} transaction_id - Transaction ID
 * @returns {Promise}
 */
async function getTransactionById(transaction_id) {
  try {
    return await transactionsRepository.getTransactionById(transaction_id);
  } catch (error) {
    return null;
  }
}

/**
 * Get transaction summary for a user
 * @param {string} country_id - Country ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Promise}
 */
async function getTransactionSummary(
  country_id,
  startDate = null,
  endDate = null
) {
  try {
    let transactions;

    if (startDate && endDate) {
      transactions = await transactionsRepository.getTransactionsByDateRange(
        country_id,
        startDate,
        endDate
      );
    } else {
      transactions =
        await transactionsRepository.getTransactionsByCountryId(country_id);
    }

    // Use the utility function to generate summary
    return transactionFilters.getTransactionSummary(transactions);
  } catch (error) {
    return null;
  }
}

module.exports = {
  recordTransaction,
  getTransactionHistory,
  getRecentTransactions,
  getTransactionById,
  getTransactionSummary,
};
