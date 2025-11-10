const TransactionsSchema = {
  transaction_id: String,
  country_id: String,
  transaction_type: String,
  // 'deposit', 'withdrawal', 'transfer_in', 'transfer_out'
  amount: Number,
  balance_before: Number,
  balance_after: Number,
  description: String,
  recipient_country_id: String,
  // 'completed', 'pending', 'failed'
  transaction_status: String,
  created_at: Date,
  updated_at: Date,
};

module.exports = TransactionsSchema;
