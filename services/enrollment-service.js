const uuid = require('uuid');
const { validateCourseEnrollmentRequest } = require('../validators/course-enrollment-validator');
const { findCourseById } = require('./courses-helper');

const { studentsEnrollmentCollection, usersCollection } = require('../firestore/firestore_db');


const createEnrollment = async function (req, res) {
    const enrollmentRequest = req.body;
    const validationResult = validateCourseEnrollmentRequest(enrollmentRequest);
    if (validationResult.error) {
        return res.status(400).send(validationResult.error);
    }
    const course = findCourseById(enrollmentRequest.course_id);
    if (!course) {
        return res.status(400).send({
            status: 'FAILED',
            message: 'Invalid Course',
            errors: []
        });
    }
    let usersWithExistingUsername = await usersCollection.doc(enrollmentRequest.student_username).get();
    if (!usersWithExistingUsername.exists) {
        return res.status(400).send({
            status: 'FAILED',
            message: 'User does not exist',
            errors: [{ username: 'User does not exist' }]
        });
    }
    const enrollmentId = uuid.v1();
    const enrollmentData = {
        student_username: enrollmentRequest.student_username,
        course_id: enrollmentRequest.course_id,
        course_title: course.title,
        course_author: course.author,
        course_image: course.image,
        enrollment_id: enrollmentId,
    };

    await studentsEnrollmentCollection.doc(enrollmentId).set(enrollmentData);
    return res.send(enrollmentData);
};


const listEnrollments = async function (req, res) {
    const { student_username } = req.params;
    if (!student_username) {
        return res.status(400).send({
            status: 'FAILED',
            message: 'provide student_username as request parameter',
            errors: [{ student_username: 'No student_username' }]
        });
    }
    const enrollments = await studentsEnrollmentCollection
        .where("student_username", "==", student_username)
        .get();
    const student_enrollments = [];
    enrollments.forEach((enrollment) => {
        student_enrollments.push(enrollment.data());
    });
    return res.status(200).send({
        enrollments: student_enrollments, status: 'SUCCESS',
        'message': `You have ${student_enrollments.length} enrollments`
    });
};

const deleteEnrollment = async function (req, res) {
    const { enrollment_id } = req.params;
    if (!enrollment_id) {
        return res.status(400).send({
            status: 'FAILED',
            message: 'provide enrollment_id as request parameter',
            errors: [{ enrollment_id: 'No enrollment_id' }]
        });
    }
    const enrollmentDoc = studentsEnrollmentCollection.doc(enrollment_id);
    await enrollmentDoc.delete();
    return res.status(200).send({
        status: 'SUCCESS',
        message: 'Enrollment successfully deleted'
    });
};

module.exports = {
    createEnrollment,
    listEnrollments,
    deleteEnrollment,
};


