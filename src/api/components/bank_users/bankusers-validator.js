const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  createBankAcc: {
    body: {
      country_id: joi.string().required().label('Country ID'),
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      birth_date: joi.date().iso().required().label('Birth Date'),
      debit_card_type: joi
        .string()
        .valid('bronze', 'express', 'gold')
        .required()
        .label('Debit Card Type'),
      deposit_money: joi
        .number()
        .integer()
        .min(0)
        .required()
        .label('Deposit Money'),
      password: joiPassword
        .string()
        .minOfSpecialCharacters(1)
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(32)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
    },
  },

  deleteBankAcc: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
  },

  depositMoney: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
    body: {
      deposited_money: joi
        .number()
        .integer()
        .min(1)
        .required()
        .label('Deposited Money'),
      password: joi.string().required().label('Password'),
    },
  },

  retrieveMoney: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
    body: {
      retrieved_money: joi
        .number()
        .integer()
        .min(1)
        .required()
        .label('Retrieved Money'),
      password: joi.string().required().label('Password'),
    },
  },

  lockAccount: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
    body: {
      reason: joi.string().min(1).max(500).required().label('Lock Reason'),
    },
  },

  unlockAccount: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
  },

  getAccountStatus: {
    params: {
      country_id: joi.string().required().label('Country ID'),
    },
  },
};
