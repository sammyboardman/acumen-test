const admin = require("firebase-admin");

if (!process.env.SERVICE_ACCOUNT_FILE_NAME) {
    process.env.SERVICE_ACCOUNT_FILE_NAME = 'acumentest-8aecc-firebase-adminsdk-nv6m8-beb7631fa2.json';
}

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'https://acumen-test.firebaseio.com';
}
const serviceAccount = require(`../${process.env.SERVICE_ACCOUNT_FILE_NAME}`);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.DATABASE_URL
    });
}

const db = admin.firestore();

const usersCollection = db.collection('users');
const verificationCodesCollection = db.collection('verification-codes');
const studentsEnrollmentCollection = db.collection('students-enrollments');

module.exports = {
    usersCollection,
    verificationCodesCollection,
    studentsEnrollmentCollection
};
