const BankUsersSchema = {
  country_id: String,
  name: String,
  email: String,
  birth_date: String,
  debit_card_type: String,
  deposit_money: Number,
  password: String,
  is_locked: Boolean,
  locked_reason: String,
  locked_at: Date,
  failed_login_attempts: Number,
  last_failed_login: Date,
  created_at: Date,
  updated_at: Date,
};

module.exports = BankUsersSchema;
