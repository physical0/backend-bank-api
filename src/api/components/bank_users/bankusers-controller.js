const bankUsersService = require('./bankusers-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const moment = require('moment');

// Note: for users components comments i used bahasa indonesia
// while bank-users and authentication components comments are in english

/**
 * Handle get list of bank accounts request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getAllBankAcc(request, response, next) {
  try {
    const balance_min = parseInt(request.query.balance_min);
    const balance_max = parseInt(request.query.balance_max);

    const users = await bankUsersService.getAllBankAcc();

    // search based on balance in deposit feature
    // search must be bigger than or equal to 0 and balance max > min
    if (balance_min >= 0 && balance_max >= balance_min) {
      const balance_range_user = await bankUsersService.searchRange(
        users,
        balance_min,
        balance_max
      );

      balance_user_length = balance_range_user.length;

      return response
        .status(200)
        .json({ user_amount: balance_user_length, balance_range_user });
    }

    if (balance_min >= 0 && !balance_max) {
      const balance_range_user = await bankUsersService.searchRange(
        users,
        balance_min,
        Infinity
      );

      balance_user_length = balance_range_user.length;

      return response
        .status(200)
        .json({ user_amount: balance_user_length, balance_range_user });
    }

    if (balance_max >= 0 && !balance_min) {
      const balance_range_user = await bankUsersService.searchRange(
        users,
        0,
        balance_max
      );

      balance_user_length = balance_range_user.length;

      return response
        .status(200)
        .json({ user_amount: balance_user_length, balance_range_user });
    }
    return response.status(200).json(users);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get bank account detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBankAcc(request, response, next) {
  try {
    const country_id = request.params.country_id;

    const user = await bankUsersService.getBankAcc(country_id);

    if (!user) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Unknown bank account'
      );
    }

    return response.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create bank account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createBankAcc(request, response, next) {
  try {
    const country_id = request.body.country_id;
    const name = request.body.name;
    const email = request.body.email;
    const birth_date = request.body.birth_date;
    const debit_card_type = request.body.debit_card_type;
    const deposit_money = request.body.deposit_money;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // If email is already registered
    const emailIsRegistered = await bankUsersService.emailIsRegistered(email);
    if (emailIsRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Email is already registered'
      );
    }

    // If country id is already registered
    const countryIdRegistered =
      await bankUsersService.countryIdIsRegistered(country_id);
    if (countryIdRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Country Id is already registered'
      );
    }

    // Debit card selection between bronze, express or gold (inspiration from Bank BCA)
    debit_card = debit_card_type.toLowerCase();
    if (
      !(
        debit_card === 'bronze' ||
        debit_card === 'express' ||
        debit_card === 'gold'
      )
    ) {
      throw errorResponder(
        errorTypes.NO_ARGUMENT,
        'Only bronze, express, and gold debit card types exist'
      );
    }

    // Minimum limit to deposit for each debit card type
    if (debit_card === 'bronze') {
      if (deposit_money < 50000) {
        throw errorResponder(
          errorTypes.BAD_REQUEST,
          'Bronze debit card first deposit must be equal or more than 50,000'
        );
      }
    }

    if (debit_card === 'express') {
      if (deposit_money < 100000) {
        throw errorResponder(
          errorTypes.BAD_REQUEST,
          'Express debit card first deposit must be equal or more than 100,000'
        );
      }
    }

    if (debit_card === 'gold') {
      if (deposit_money < 200000) {
        throw errorResponder(
          errorTypes.BAD_REQUEST,
          'Gold debit card first deposit must be equal or more than 200,000'
        );
      }
    }

    const success = await bankUsersService.createBankAcc(
      country_id,
      name,
      email,
      birth_date,
      debit_card,
      deposit_money,
      password
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create bank account'
      );
    }

    const changebirthdate = moment(birth_date);
    const birthdate_format = changebirthdate.format('YYYY-MM-DD');

    return response.status(200).json({
      country_id,
      name,
      email,
      country_id,
      birthdate_format,
      debit_card,
      deposit_money,
    });
  } catch (error) {
    return next(error);
  }
}
/**
 * Handle delete bank account request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteBankAcc(request, response, next) {
  try {
    const country_id = request.params.country_id;

    // delete by bank account country id
    const success = await bankUsersService.deleteBankAcc(country_id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete user'
      );
    }

    return response.status(200).json({ country_id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle money deposit request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function depositMoney(request, response, next) {
  try {
    const country_id = request.params.country_id;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const deposited_money = request.body.deposited_money;

    const user = await bankUsersService.getBankAcc(country_id);

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // If password is not invalid or mistaken
    const checkPassword = await bankUsersService.checkPassword(
      country_id,
      password
    );
    if (!checkPassword) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    // If email has not been registered
    const emailIsRegistered = await bankUsersService.emailIsRegistered(email);
    if (!emailIsRegistered) {
      throw errorResponder(
        errorTypes.WRONG_EMAIL_CONFIRM_TOKEN,
        'Email is not registered'
      );
    }

    // If email doesn't match database email
    if (email !== user.email) {
      throw errorResponder(
        errorTypes.WRONG_EMAIL_CONFIRM_TOKEN,
        'Email confirmation mismatched'
      );
    }

    // Country Id has not been registered
    const countryIdRegistered =
      await bankUsersService.countryIdIsRegistered(country_id);
    if (!countryIdRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Country Id has not been registered'
      );
    }

    // Deposit money in user's bank account
    const depositMoney = await bankUsersService.insertMoney(
      country_id,
      deposited_money
    );
    if (!depositMoney) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to deposit money into bank account'
      );
    }

    return response
      .status(200)
      .json({ country_id, deposited_balance: deposited_money });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle money retrieval request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function retrieveMoney(request, response, next) {
  try {
    const country_id = request.params.country_id;
    const email = request.body.email;
    const password = request.body.password;
    const password_confirm = request.body.password_confirm;
    const retrieved_money = request.body.retrieved_money;

    const user = await bankUsersService.getBankAcc(country_id);

    // Check confirmation password
    if (password !== password_confirm) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }

    // If password is not invalid or mistaken
    const checkPassword = await bankUsersService.checkPassword(
      country_id,
      password
    );
    if (!checkPassword) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }

    // If email has not been registered
    const emailIsRegistered = await bankUsersService.emailIsRegistered(email);
    if (!emailIsRegistered) {
      throw errorResponder(
        errorTypes.WRONG_EMAIL_CONFIRM_TOKEN,
        'Email is not registered'
      );
    }
    // If email doesn't match database email
    if (email !== user.email) {
      throw errorResponder(
        errorTypes.WRONG_EMAIL_CONFIRM_TOKEN,
        'Email confirmation mismatched'
      );
    }

    // Country Id has not been registered
    const countryIdRegistered =
      await bankUsersService.countryIdIsRegistered(country_id);
    if (!countryIdRegistered) {
      throw errorResponder(
        errorTypes.EMAIL_ALREADY_TAKEN,
        'Country Id has not been registered'
      );
    }

    // Retrieve money from user's bank account
    const obtainMoney = await bankUsersService.obtainMoney(
      country_id,
      retrieved_money
    );
    if (!obtainMoney) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to retrieve money from bank account'
      );
    }

    return response
      .status(200)
      .json({ country_id, retrieved_balance: retrieved_money });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllBankAcc,
  getBankAcc,
  createBankAcc,
  deleteBankAcc,
  depositMoney,
  retrieveMoney,
};
