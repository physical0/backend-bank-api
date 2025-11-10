const { BankUser } = require('../../../models');

/**
 * Get a list of bank accounts
 * @returns {Promise}
 */
async function getBankUsers() {
  return BankUser.find({});
}

/**
 * Get bank account detail by country id
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function getUserByCountryId(country_id) {
  return BankUser.findOne({ country_id });
}

/**
 * Get bank account by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return BankUser.findOne({ email });
}

/**
 * Create new bank account
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} country_id - Country ID
 * @param {string} birth_date - Birth date
 * @param {string} debit_card_type - Card type
 * @param {string} deposit_money - Deposit money
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createBankAcc(
  country_id,
  name,
  email,
  birth_date,
  debit_card_type,
  deposit_money,
  password
) {
  return BankUser.create({
    country_id,
    name,
    email,
    birth_date,
    debit_card_type,
    deposit_money,
    password,
  });
}

/**
 * Delete a bank account
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function deleteBankAcc(country_id) {
  return BankUser.deleteOne({ country_id });
}

/**
 * Deposit or obtain money into/from bank account by country id
 * @param {string} country_id - Country ID
 * @param {number} deposit_money - Updated deposit money
 * @returns {Promise}
 */
async function updateBalance(country_id, deposit_money) {
  return BankUser.updateOne(
    {
      country_id,
    },
    {
      $set: {
        deposit_money,
        updated_at: new Date(),
      },
    }
  );
}

/**
 * Lock a bank account
 * @param {string} country_id - Country ID
 * @param {string} reason - Reason for locking
 * @returns {Promise}
 */
async function lockAccount(country_id, reason) {
  return BankUser.updateOne(
    { country_id },
    {
      $set: {
        is_locked: true,
        locked_reason: reason,
        locked_at: new Date(),
        updated_at: new Date(),
      },
    }
  );
}

/**
 * Unlock a bank account
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function unlockAccount(country_id) {
  return BankUser.updateOne(
    { country_id },
    {
      $set: {
        is_locked: false,
        locked_reason: null,
        locked_at: null,
        failed_login_attempts: 0,
        updated_at: new Date(),
      },
    }
  );
}

/**
 * Increment failed login attempts
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function incrementFailedLoginAttempts(country_id) {
  return BankUser.updateOne(
    { country_id },
    {
      $inc: { failed_login_attempts: 1 },
      $set: {
        last_failed_login: new Date(),
        updated_at: new Date(),
      },
    }
  );
}

/**
 * Reset failed login attempts
 * @param {string} country_id - Country ID
 * @returns {Promise}
 */
async function resetFailedLoginAttempts(country_id) {
  return BankUser.updateOne(
    { country_id },
    {
      $set: {
        failed_login_attempts: 0,
        last_failed_login: null,
        updated_at: new Date(),
      },
    }
  );
}

/**
 * Update account creation with default values
 * @param {string} country_id - Country ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} birth_date - Birth date
 * @param {string} debit_card_type - Card type
 * @param {number} deposit_money - Deposit money
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createBankAccWithDefaults(
  country_id,
  name,
  email,
  birth_date,
  debit_card_type,
  deposit_money,
  password
) {
  return BankUser.create({
    country_id,
    name,
    email,
    birth_date,
    debit_card_type,
    deposit_money,
    password,
    is_locked: false,
    locked_reason: null,
    locked_at: null,
    failed_login_attempts: 0,
    last_failed_login: null,
    created_at: new Date(),
    updated_at: new Date(),
  });
}

module.exports = {
  getBankUsers,
  getUserByCountryId,
  createBankAcc,
  createBankAccWithDefaults,
  getUserByEmail,
  deleteBankAcc,
  updateBalance,
  lockAccount,
  unlockAccount,
  incrementFailedLoginAttempts,
  resetFailedLoginAttempts,
};
