const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/task.controller');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Validation rules
const updateTaskValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid task ID is required.'),
  body('status')
    .optional()
    .isIn(['TODO', 'IN_PROGRESS', 'DONE']).withMessage('Status must be one of: TODO, IN_PROGRESS, DONE.'),
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Task title cannot be empty.')
    .isLength({ max: 200 }).withMessage('Task title cannot exceed 200 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters.'),
  body('deadline')
    .optional({ nullable: true })
    .isString().withMessage('Deadline must be a string or date.'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH.'),
  body('assignee_ids')
    .optional()
    .isArray().withMessage('assignee_ids must be an array.'),
  validate,
];

const idParamValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid task ID is required.'),
  validate,
];

// Routes
router.get('/:id', idParamValidation, taskController.getTaskById);
router.put('/:id', updateTaskValidation, taskController.updateTask);
router.delete('/:id', idParamValidation, taskController.deleteTask);

module.exports = router;
