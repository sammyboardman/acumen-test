const bcrypt = require('bcrypt');
const util = require('util');
const jwt = require('jsonwebtoken')
const { validateNewUserRequest } = require('../validators/register-user-request-validator');
const { validateVerifyUserRequest } = require('../validators/verify-user-validator');
const { validateLoginRequest } = require('../validators/login-request-validator');

const { usersCollection, verificationCodesCollection } = require('../firestore/firestore_db');
const { sendVerificationCodeToUser } = require('../services/mail-service');

const bcryptHash = util.promisify(bcrypt.hash);
const bcryptCompare = util.promisify(bcrypt.compare);


const generateVerificationCode = function () {
    return Math.floor(100000 + Math.random() * 900000);
};


const persistUserVerificationCode = async function (username, verificationCode) {
    const verificationCodeData = {
        username,
        code: verificationCode,
        activated: false,
    };
    verificationCode = `${verificationCode}`;
    await verificationCodesCollection.doc(verificationCode).set(verificationCodeData);
};

const hashUserPassword = async function (userData) {
    userData.password = await bcryptHash(userData.password, 10);
};

const registerNewUser = async function (req, res) {
    let userData = req.body;

    const result = validateNewUserRequest(userData);
    if (result.error) {
        const response = {};
        response[result.error.details[0].path[0]] = result.error.details[0].message;
        return res.status(400).send({
            status: 'FAILED',
            message: 'Registration failed',
            errors: [response]
        });
    }

    const username = userData.user_name ? userData.user_name : userData.email;
    let usersWithExistingUsername = await usersCollection.doc(username).get();
    if (usersWithExistingUsername.exists) {
        return res.status(400).send({
            status: 'FAILED',
            message: 'A user already exist with the same username',
            errors: [{ username: 'A user already exist with the same username' }]
        });
    }

    userData = {
        ...userData,
        emailConfirmed: false
    };
    userData.username = username;
    await hashUserPassword(userData);
    await usersCollection.doc(username).set(userData);
    const verificationCode = generateVerificationCode();
    await sendVerificationCodeToUser(userData, verificationCode);
    await persistUserVerificationCode(username, verificationCode);
    return res.status(200).send({
        status: 'SUCCESS',
        message: `Verification token has been sent to ${userData.email}.`
    }
    );

};


const verifyUserEmail = async function (req, res) {
    try {

        let verifyUserRequest = req.body;
        const result = validateVerifyUserRequest(verifyUserRequest);
        if (result.error) {
            const response = {};
            response[result.error.details[0].path[0]] = result.error.details[0].message;
            return res.status(400).send({
                status: 'FAILED',
                message: 'Registration failed',
                errors: [response]
            });
        }

        let existingVerificationCode = await verificationCodesCollection.doc(verifyUserRequest.verification_code).get();
       
        if (!existingVerificationCode.exists) {
            return res.status(400).send({
                status: 'FAILED',
                message: 'Invalid Verification Code',
                errors: [{ verification_code: 'Invalid Verification Code' }]
            });
        }
        existingVerificationCode = existingVerificationCode.data();
        if (existingVerificationCode.activated) {
            return res.status(400).send({
                status: 'FAILED',
                message: 'Verification Code already activated',
                errors: [{ verification_code: 'Verification Code already activated' }]
            });
        }

        if (existingVerificationCode.username !== verifyUserRequest.email) {
            return res.status(400).send({
                status: 'FAILED',
                message: 'Invalid Verification Code',
                errors: [{ verification_code: 'Invalid Verification Code' }]
            });
        }
        existingVerificationCode.activated = true;
        await verificationCodesCollection.doc(verifyUserRequest.verification_code).set(existingVerificationCode);

        let userData = await usersCollection.doc(existingVerificationCode.username).get();
        userData = userData.data();
        userData.emailConfirmed = true;
        await usersCollection.doc(existingVerificationCode.username).set(userData);
        return res.status(200).send({
            status: 'SUCCESS',
            message: 'Registration succesful.'
        });

    } catch (e) {
        return res.status(500).send(e.message);
    }
};


const login = async function (req, res) {

    let loginRequest = req.body;
    let message = '';
    const validationResult = validateLoginRequest(loginRequest);
    if (validationResult.error) {
        const response = {};
        response[validationResult.error.details[0].path[0]] = validationResult.error.details[0].message;
        message = 'Login failed'
        return res.status(400).send({
            status: 'FAILED',
            message,
            errors: [response]
        });
    }

    let existingUser = await usersCollection.doc(loginRequest.username).get();
    if (!existingUser.exists) {
        message = 'Invalid username/password combination';
        return res.status(401).send({
            status: 'FAILED',
            message,
            errors: [{ username: message }, { password: message }]
        });
    }
    existingUser = existingUser.data();

    if (!existingUser.emailConfirmed) {
        message = 'user email is not verified';
        return res.status(401).send({
            status: 'FAILED',
            message,
            errors: [{ email: message }]
        });
    }
    const bcryptResult = await bcryptCompare(loginRequest.password, existingUser.password);
    if (!bcryptResult) {
        message = 'Invalid username/password combination';
        return res.status(401).send({
            status: 'FAILED',
            message,
            errors: [{ username: message }, { password: message }]
        });
    }
    delete existingUser.password;
    const token = jwt.sign({data: existingUser,}, process.env.JWT_SECRET, {expiresIn: 60 * 60});
    return res.status(200).send({
        user: existingUser,
        token,
        status: 'SUCCESS',
        message: 'Login succesful.'
    });

};

module.exports = {
    registerNewUser,
    verifyUserEmail,
    login
};
