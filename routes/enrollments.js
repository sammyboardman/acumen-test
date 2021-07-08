const express = require('express');
const router = express.Router();
const { createEnrollment, listEnrollments, deleteEnrollment } = require('../services/enrollment-service');
const { authenticateToken } = require('../middlewares/auth-middleware');

router.get('/:student_username', authenticateToken, function (req, res, next) {
    return listEnrollments(req, res);
});

router.delete('/:enrollment_id', authenticateToken, function (req, res, next) {
    return deleteEnrollment(req, res)
});

router.post('/', authenticateToken, function (req, res, next) {
    return createEnrollment(req, res);
});

module.exports = router;
