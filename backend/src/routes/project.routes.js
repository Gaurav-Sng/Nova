const express = require('express');
const { body, param } = require('express-validator');
const projectController = require('../controllers/project.controller');
const taskController = require('../controllers/task.controller');
const memberRoutes = require('./member.routes');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// Validation rules
const projectValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required.')
    .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('status')
    .optional()
    .isIn(['IN_PROGRESS', 'COMPLETED']).withMessage('Status must be IN_PROGRESS or COMPLETED.'),
  validate,
];

const projectUpdateValidation = [
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required.'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty.')
    .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters.'),
  body('status')
    .optional()
    .isIn(['IN_PROGRESS', 'COMPLETED']).withMessage('Status must be IN_PROGRESS or COMPLETED.'),
  validate,
];

const taskCreationValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Valid project ID is required.'),
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required.')
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
  param('id').isInt({ min: 1 }).withMessage('Valid ID is required.'),
  validate,
];

// Routes
router.get('/', projectController.getAllProjects);
router.post('/', projectValidation, projectController.createProject);
router.get('/:id', idParamValidation, projectController.getProjectById);
router.put('/:id', projectUpdateValidation, projectController.updateProject);
router.delete('/:id', idParamValidation, projectController.deleteProject);

// Nested task creation under a project (POST /api/projects/:id/tasks)
router.post('/:id/tasks', taskCreationValidation, taskController.createTask);

// Nested member routes (GET/POST/DELETE /api/projects/:id/members)
router.use('/:id/members', memberRoutes);

module.exports = router;
