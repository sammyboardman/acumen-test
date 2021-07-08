const Joi = require('joi');

const verifyUserValidator = Joi.object({
    email: Joi.string().required(),
    verification_code: Joi.string().max(6).min(6).required(),
});


const validateVerifyUserRequest = function (verifyUserRequest) {
    return verifyUserValidator.validate(verifyUserRequest);
};

module.exports = {
    validateVerifyUserRequest,
};
