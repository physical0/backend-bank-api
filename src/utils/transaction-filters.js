/**
 * Transaction filtering utilities
 */

/**
 * Filter transactions by type
 * @param {Array} transactions - Array of transactions
 * @param {string} transaction_type - Type to filter by
 * @returns {Array} Filtered transactions
 */
function filterByType(transactions, transaction_type) {
  if (!transaction_type || !transactions) {
    return transactions;
  }

  return transactions.filter(
    (transaction) => transaction.transaction_type === transaction_type
  );
}

/**
 * Filter transactions by date range
 * @param {Array} transactions - Array of transactions
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered transactions
 */
function filterByDateRange(transactions, startDate, endDate) {
  if (!startDate || !endDate || !transactions) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.created_at);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}

/**
 * Apply pagination to transactions
 * @param {Array} transactions - Array of transactions
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object} Paginated result with metadata
 */
function applyPagination(transactions, page = 1, limit = 10) {
  if (!transactions || !Array.isArray(transactions)) {
    return {
      transactions: [],
      totalPages: 0,
      currentPage: page,
      totalTransactions: 0,
    };
  }

  const total = transactions.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  return {
    transactions: paginatedTransactions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    totalTransactions: total,
  };
}

/**
 * Apply multiple filters to transactions
 * @param {Array} transactions - Array of transactions
 * @param {Object} filters - Filter options
 * @param {string} filters.transaction_type - Transaction type filter
 * @param {Date} filters.startDate - Start date filter
 * @param {Date} filters.endDate - End date filter
 * @param {number} filters.minAmount - Minimum amount filter
 * @param {number} filters.maxAmount - Maximum amount filter
 * @returns {Array} Filtered transactions
 */
function applyFilters(transactions, filters = {}) {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  let filteredTransactions = [...transactions];

  // Apply transaction type filter
  if (filters.transaction_type) {
    filteredTransactions = filterByType(
      filteredTransactions,
      filters.transaction_type
    );
  }

  // Apply date range filter
  if (filters.startDate && filters.endDate) {
    filteredTransactions = filterByDateRange(
      filteredTransactions,
      filters.startDate,
      filters.endDate
    );
  }

  // Apply amount range filter
  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    filteredTransactions = filterByAmountRange(
      filteredTransactions,
      filters.minAmount,
      filters.maxAmount
    );
  }

  return filteredTransactions;
}

/**
 * Filter transactions by amount range
 * @param {Array} transactions - Array of transactions
 * @param {number} minAmount - Minimum amount
 * @param {number} maxAmount - Maximum amount
 * @returns {Array} Filtered transactions
 */
function filterByAmountRange(transactions, minAmount, maxAmount) {
  if (!transactions) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    const amount = transaction.amount;

    if (minAmount !== undefined && amount < minAmount) {
      return false;
    }

    if (maxAmount !== undefined && amount > maxAmount) {
      return false;
    }

    return true;
  });
}

/**
 * Sort transactions by date (most recent first)
 * @param {Array} transactions - Array of transactions
 * @param {string} order - 'asc' or 'desc' (default: 'desc')
 * @returns {Array} Sorted transactions
 */
function sortByDate(transactions, order = 'desc') {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  return transactions.sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);

    if (order === 'asc') {
      return dateA - dateB;
    }
    return dateB - dateA; // desc (most recent first)
  });
}

/**
 * Get transaction summary statistics
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Summary statistics
 */
function getTransactionSummary(transactions) {
  if (!transactions || !Array.isArray(transactions)) {
    return getEmptySummary();
  }

  const summary = {
    total_transactions: transactions.length,
    total_deposits: 0,
    total_withdrawals: 0,
    total_transfers_in: 0,
    total_transfers_out: 0,
    deposit_count: 0,
    withdrawal_count: 0,
    transfer_in_count: 0,
    transfer_out_count: 0,
  };

  transactions.forEach((transaction) => {
    const amount = transaction.amount || 0;

    switch (transaction.transaction_type) {
      case 'deposit':
        summary.total_deposits += amount;
        summary.deposit_count += 1;
        break;
      case 'withdrawal':
        summary.total_withdrawals += amount;
        summary.withdrawal_count += 1;
        break;
      case 'transfer_in':
        summary.total_transfers_in += amount;
        summary.transfer_in_count += 1;
        break;
      case 'transfer_out':
        summary.total_transfers_out += amount;
        summary.transfer_out_count += 1;
        break;
    }
  });

  return summary;
}

/**
 * Get empty summary object
 * @returns {Object} Empty summary
 */
function getEmptySummary() {
  return {
    total_transactions: 0,
    total_deposits: 0,
    total_withdrawals: 0,
    total_transfers_in: 0,
    total_transfers_out: 0,
    deposit_count: 0,
    withdrawal_count: 0,
    transfer_in_count: 0,
    transfer_out_count: 0,
  };
}

module.exports = {
  filterByType,
  filterByDateRange,
  filterByAmountRange,
  applyPagination,
  applyFilters,
  sortByDate,
  getTransactionSummary,
  getEmptySummary,
};
