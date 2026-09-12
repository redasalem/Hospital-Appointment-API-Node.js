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


router.post(
  '/',
  protect,
  restrictTo('admin'),
  validate(createDoctorSchema, 'body'),
  doctorController.createDoctor
);


router.get(
  '/',
  validate(doctorQuerySchema, 'query'),
  doctorController.getAllDoctors
);


router.get(
  '/:id',
  validate(doctorIdParamSchema, 'params'),
  doctorController.getDoctorById
);


router.patch(
  '/:id',
  protect,
  restrictTo('admin'),
  validate(doctorIdParamSchema, 'params'),
  validate(updateDoctorSchema, 'body'),
  doctorController.updateDoctor
);


router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  validate(doctorIdParamSchema, 'params'),
  doctorController.deleteDoctor
);

module.exports = router;
