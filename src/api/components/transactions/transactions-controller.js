const transactionsService = require('./transactions-service');
const { errorResponder, errorTypes } = require('../../../core/errors');

/**
 * Handle get transaction history request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactionHistory(request, response, next) {
  try {
    const country_id = request.params.country_id;
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;

    // Optional filters
    const filters = {};

    if (request.query.start_date) {
      filters.startDate = request.query.start_date;
    }

    if (request.query.end_date) {
      filters.endDate = request.query.end_date;
    }

    if (request.query.transaction_type) {
      const validTypes = [
        'deposit',
        'withdrawal',
        'transfer_in',
        'transfer_out',
      ];
      if (validTypes.includes(request.query.transaction_type)) {
        filters.transaction_type = request.query.transaction_type;
      }
    }

    const result = await transactionsService.getTransactionHistory(
      country_id,
      filters,
      page,
      limit
    );

    if (!result) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to retrieve transaction history'
      );
    }

    return response.status(200).json({
      country_id,
      page: result.currentPage,
      total_pages: result.totalPages,
      total_transactions: result.totalTransactions,
      transactions: result.transactions,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get recent transactions request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getRecentTransactions(request, response, next) {
  try {
    const country_id = request.params.country_id;

    const transactions =
      await transactionsService.getRecentTransactions(country_id);

    if (!transactions) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to retrieve recent transactions'
      );
    }

    return response.status(200).json({
      country_id,
      recent_transactions: transactions,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get transaction by ID request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactionById(request, response, next) {
  try {
    const transaction_id = request.params.transaction_id;

    const transaction =
      await transactionsService.getTransactionById(transaction_id);

    if (!transaction) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Transaction not found'
      );
    }

    return response.status(200).json(transaction);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get transaction summary request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getTransactionSummary(request, response, next) {
  try {
    const country_id = request.params.country_id;

    let startDate = null;
    let endDate = null;

    if (request.query.start_date) {
      startDate = new Date(request.query.start_date);
    }

    if (request.query.end_date) {
      endDate = new Date(request.query.end_date);
    }

    const summary = await transactionsService.getTransactionSummary(
      country_id,
      startDate,
      endDate
    );

    if (!summary) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to retrieve transaction summary'
      );
    }

    return response.status(200).json({
      country_id,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      summary,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getTransactionHistory,
  getRecentTransactions,
  getTransactionById,
  getTransactionSummary,
};
