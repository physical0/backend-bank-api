const bankUsersRepository = require('./bankusers-repository');
const transactionsService = require('../transactions/transactions-service');
const { hashPassword, passwordMatched } = require('../../../utils/password');

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 30;

/**
 * Get list of bank acccounts
 * @returns {Array}
 */
async function getAllBankAcc() {
  const users = await bankUsersRepository.getBankUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      country_id: user.country_id,
      name: user.name,
      email: user.email,
      birth_date: user.birth_date,
      debit_card_type: user.debit_card_type,
      deposit_money: user.deposit_money,
    });
  }

  return results;
}

/**
 * Search for users in balance range
 * @param {Array} users - Bank Users
 * @param {integer} balance_max - balance max
 *  @param {integer} balance_min - balance min
 * @returns {Array}
 */

async function searchRange(users, balance_min, balance_max) {
  // Extra feature for searching bank account users based on balance range
  // Easen the teller in searching for an account based on range
  const searched_users = users.filter((user) => {
    const bank_balance = user.deposit_money;
    if (bank_balance <= balance_max && bank_balance >= balance_min) {
      return bank_balance;
    }
  });

  return searched_users;
}

/**
 * Get bank account details
 * @param {string} country_id - Country ID
 * @returns {Object}
 */
async function getBankAcc(country_id) {
  const user = await bankUsersRepository.getUserByCountryId(country_id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    country_id: user.country_id,
    name: user.name,
    email: user.email,
    birth_date: user.birth_date,
    debit_card_type: user.debit_card_type,
    deposit_money: user.deposit_money,
  };
}

/**
 * Create new bank account
 * @param {string} country_id - Country ID card number
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} birth_date - Birth date
 * @param {string} debit_card_type - Card type
 * @param {integer} deposit_money - Deposit money
 * @param {string} password - Password
 * @returns {boolean}
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
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await bankUsersRepository.createBankAccWithDefaults(
      country_id,
      name,
      email,
      birth_date,
      debit_card_type,
      deposit_money,
      hashedPassword
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Insert money to bank acc deposit
 * @param {string} country_id - Country ID
 * @param {integer} deposited_money - Deposited money
 * @returns {boolean}
 */
async function insertMoney(country_id, deposited_money) {
  try {
    const user = await bankUsersRepository.getUserByCountryId(country_id);
    const balance_before = user.deposit_money;
    const balance_after = balance_before + deposited_money;

    if (user) {
      await bankUsersRepository.updateBalance(country_id, balance_after);

      // Record the transaction
      await transactionsService.recordTransaction(
        country_id,
        'deposit',
        deposited_money,
        balance_before,
        balance_after,
        `Deposit of ${deposited_money}`
      );
    }
  } catch (error) {
    return null;
  }
  return true;
}

/**
 * Retrieve money from bank acc deposit
 * @param {string} country_id - Country ID
 * @param {integer} retrieved_money - Deposited money
 * @returns {boolean}
 */
async function obtainMoney(country_id, retrieved_money) {
  try {
    const user = await bankUsersRepository.getUserByCountryId(country_id);
    const balance_before = user.deposit_money;
    const balance_after = balance_before - retrieved_money;

    if (user) {
      await bankUsersRepository.updateBalance(country_id, balance_after);

      // Record the transaction
      await transactionsService.recordTransaction(
        country_id,
        'withdrawal',
        retrieved_money,
        balance_before,
        balance_after,
        `Withdrawal of ${retrieved_money}`
      );
    }
  } catch (error) {
    return null;
  }
  return true;
}

/**
 * Delete bank user
 * @param {string} country_id - User ID
 * @returns {boolean}
 */
async function deleteBankAcc(country_id) {
  const user = await bankUsersRepository.getUserByCountryId(country_id);

  // if bank user not found
  if (!user) {
    return null;
  }

  try {
    await bankUsersRepository.deleteBankAcc(country_id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await bankUsersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the country id is registered
 * @param {string} country_id - country_id
 * @returns {boolean}
 */
async function countryIdIsRegistered(country_id) {
  const user = await bankUsersRepository.getUserByCountryId(country_id);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct and handle failed login attempts
 * @param {string} country_id - Country Id
 * @param {string} password - Password
 * @returns {object} Result object with success status and message
 */
async function checkPassword(country_id, password) {
  const user = await bankUsersRepository.getUserByCountryId(country_id);

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  // Check if account is locked
  if (user.is_locked) {
    return { success: false, message: 'Account is locked', locked: true };
  }

  const isPasswordValid = await passwordMatched(password, user.password);

  if (isPasswordValid) {
    // Reset failed login attempts on successful login
    await bankUsersRepository.resetFailedLoginAttempts(country_id);
    return { success: true, message: 'Password correct' };
  } else {
    // Increment failed login attempts
    await bankUsersRepository.incrementFailedLoginAttempts(country_id);

    // Check if we should lock the account
    const updatedUser =
      await bankUsersRepository.getUserByCountryId(country_id);
    if (updatedUser.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      await lockAccount(country_id, 'security');
      return {
        success: false,
        message: 'Account locked due to multiple failed login attempts',
        locked: true,
      };
    }

    const remainingAttempts =
      MAX_FAILED_ATTEMPTS - updatedUser.failed_login_attempts;
    return {
      success: false,
      message: `Wrong password. ${remainingAttempts} attempts remaining.`,
      remainingAttempts,
    };
  }
}

/**
 * Lock a bank account
 * @param {string} country_id - Country ID
 * @param {string} reason - Reason for locking
 * @returns {boolean}
 */
async function lockAccount(country_id, reason) {
  try {
    await bankUsersRepository.lockAccount(country_id, reason);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Unlock a bank account
 * @param {string} country_id - Country ID
 * @returns {boolean}
 */
async function unlockAccount(country_id) {
  try {
    await bankUsersRepository.unlockAccount(country_id);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if account is locked
 * @param {string} country_id - Country ID
 * @returns {object}
 */
async function checkAccountStatus(country_id) {
  try {
    const user = await bankUsersRepository.getUserByCountryId(country_id);

    if (!user) {
      return { exists: false };
    }

    return {
      exists: true,
      is_locked: user.is_locked || false,
      locked_reason: user.locked_reason,
      locked_at: user.locked_at,
      failed_login_attempts: user.failed_login_attempts || 0,
      last_failed_login: user.last_failed_login,
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * Get account with lock status included
 * @param {string} country_id - Country ID
 * @returns {Object}
 */
async function getBankAccWithStatus(country_id) {
  const user = await bankUsersRepository.getUserByCountryId(country_id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    country_id: user.country_id,
    name: user.name,
    email: user.email,
    birth_date: user.birth_date,
    debit_card_type: user.debit_card_type,
    deposit_money: user.deposit_money,
    is_locked: user.is_locked || false,
    locked_reason: user.locked_reason,
    locked_at: user.locked_at,
    failed_login_attempts: user.failed_login_attempts || 0,
  };
}

module.exports = {
  getAllBankAcc,
  getBankAcc,
  getBankAccWithStatus,
  countryIdIsRegistered,
  createBankAcc,
  emailIsRegistered,
  deleteBankAcc,
  insertMoney,
  obtainMoney,
  checkPassword,
  lockAccount,
  unlockAccount,
  checkAccountStatus,
  searchRange,
};
