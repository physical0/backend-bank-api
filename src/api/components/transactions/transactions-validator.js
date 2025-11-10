const joi = require('joi');

module.exports = {
  getTransactionHistory: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
    query: {
      page: joi.number().integer().min(1).optional().label('Page'),
      limit: joi.number().integer().min(1).max(100).optional().label('Limit'),
      start_date: joi.date().iso().optional().label('Start Date'),
      end_date: joi.date().iso().optional().label('End Date'),
      transaction_type: joi
        .string()
        .valid('deposit', 'withdrawal', 'transfer_in', 'transfer_out')
        .optional()
        .label('Transaction Type'),
    },
  },

  getRecentTransactions: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
  },

  getTransactionSummary: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
    query: {
      start_date: joi.date().iso().optional().label('Start Date'),
      end_date: joi.date().iso().optional().label('End Date'),
    },
  },

  getTransactionById: {
    params: {
      transaction_id: joi.string().required().label('Transaction ID'),
    },
  },
};
