const { Transaction } = require('../../../models');

/**
 * Create a new transaction record
 * @param {object} transactionData - Transaction data
 * @returns {Promise}
 */
async function createTransaction(transactionData) {
  const transaction = new Transaction({
    ...transactionData,
    created_at: new Date(),
    updated_at: new Date(),
  });
  return transaction.save();
}

/**
 * Get all transactions for a specific country ID
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function getTransactionsByCountryId(country_id) {
  return Transaction.find({ country_id }).sort({ created_at: -1 });
}

/**
 * Get transactions by country ID with date range filter
 * @param {string} country_id - Country ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise}
 */
async function getTransactionsByDateRange(country_id, startDate, endDate) {
  return Transaction.find({
    country_id,
    created_at: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ created_at: -1 });
}

/**
 * Get transactions by country ID and transaction type
 * @param {string} country_id - Country ID
 * @param {string} transaction_type - Transaction type
 * @returns {Promise}
 */
async function getTransactionsByType(country_id, transaction_type) {
  return Transaction.find({
    country_id,
    transaction_type,
  }).sort({ created_at: -1 });
}

/**
 * Get paginated transactions for a country ID
 * @param {string} country_id - Country ID
 * @param {number} page - Page number
 * @param {number} limit - Number of transactions per page
 * @returns {Promise}
 */
async function getPaginatedTransactions(country_id, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const transactions = await Transaction.find({ country_id })
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Transaction.countDocuments({ country_id });

  return {
    transactions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    totalTransactions: total,
  };
}

/**
 * Get transaction by transaction ID
 * @param {string} transaction_id - Transaction ID
 * @returns {Promise}
 */
async function getTransactionById(transaction_id) {
  return Transaction.findOne({ transaction_id });
}

/**
 * Update transaction status
 * @param {string} transaction_id - Transaction ID
 * @param {string} status - New status
 * @returns {Promise}
 */
async function updateTransactionStatus(transaction_id, status) {
  return Transaction.updateOne(
    { transaction_id },
    {
      $set: {
        transaction_status: status,
        updated_at: new Date(),
      },
    }
  );
}

/**
 * Get recent transactions (last 5) for a country ID
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function getRecentTransactions(country_id) {
  return Transaction.find({ country_id }).sort({ created_at: -1 }).limit(5);
}

module.exports = {
  createTransaction,
  getTransactionsByCountryId,
  getTransactionsByDateRange,
  getTransactionsByType,
  getPaginatedTransactions,
  getTransactionById,
  updateTransactionStatus,
  getRecentTransactions,
};
