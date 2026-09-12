const express = require('express');
const doctorController = require('../controllers/doctor.controller');
const validate = require('../middlewares/validate.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdParamSchema,
  doctorQuerySchema,
} = require('../validators/doctor.validator');

const router = express.Router();

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor profile
 * @access  Private (Admin only)
 */
router.post(
  '/',
  protect,
  restrictTo('admin'),
  validate(createDoctorSchema, 'body'),
  doctorController.createDoctor
);

/**
 * @route   GET /api/doctors
 * @desc    Get list of doctors with optional filtering, search, and pagination
 * @access  Public
 */
router.get(
  '/',
  validate(doctorQuerySchema, 'query'),
  doctorController.getAllDoctors
);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get single doctor by ID
 * @access  Public
 */
router.get(
  '/:id',
  validate(doctorIdParamSchema, 'params'),
  doctorController.getDoctorById
);

/**
 * @route   PATCH /api/doctors/:id
 * @desc    Update a doctor profile
 * @access  Private (Admin only)
 */
router.patch(
  '/:id',
  protect,
  restrictTo('admin'),
  validate(doctorIdParamSchema, 'params'),
  validate(updateDoctorSchema, 'body'),
  doctorController.updateDoctor
);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete a doctor profile (blocked if doctor has active appointments)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  validate(doctorIdParamSchema, 'params'),
  doctorController.deleteDoctor
);

module.exports = router;
