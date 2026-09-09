const express = require('express');
const { body, param } = require('express-validator');
const memberController = require('../controllers/member.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router({ mergeParams: true }); // mergeParams to access :id from parent

// All member routes require authentication
router.use(authenticate);

const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid project ID is required.'),
  validate,
];

const addMemberValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid project ID is required.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('A valid email address is required.')
    .normalizeEmail(),
  validate,
];

const removeValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid project ID is required.'),
  param('userId').isInt({ min: 1 }).withMessage('Valid user ID is required.'),
  validate,
];

// Routes
router.get('/', idParamValidation, memberController.getMembers);
router.post('/', addMemberValidation, memberController.addMember);
router.delete('/:userId', removeValidation, memberController.removeMember);

module.exports = router;
