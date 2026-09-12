const express = require('express');
const controller = require('../controllers/appointment.controller');
const validate = require('../middlewares/validate.middleware');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { appointmentIdParamSchema, bookAppointmentSchema, appointmentQuerySchema, updateStatusSchema } = require('../validators/appointment.validator');

const router = express.Router();

router.post('/', protect, restrictTo('Patient'), validate(bookAppointmentSchema), controller.createAppointment);
router.get('/', protect, restrictTo('Admin'), validate(appointmentQuerySchema, 'query'), controller.getAllAppointments);
router.get('/my', protect, restrictTo('Patient', 'Doctor'), validate(appointmentQuerySchema, 'query'), controller.getMyAppointments);
router.patch('/:id/status', protect, restrictTo('Doctor'), validate(appointmentIdParamSchema, 'params'), validate(updateStatusSchema), controller.updateAppointmentStatus);
router.post('/:id/cancel', protect, restrictTo('Patient'), validate(appointmentIdParamSchema, 'params'), controller.cancelAppointment);
router.get('/:id', protect, validate(appointmentIdParamSchema, 'params'), controller.getAppointmentById);

module.exports = router;
