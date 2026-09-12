const Joi = require('joi');

const mongoId = Joi.string().hex().length(24);
const appointmentIdParamSchema = Joi.object({ id: mongoId.required() });
const bookAppointmentSchema = Joi.object({
  doctor: mongoId.required(),
  startsAt: Joi.date().iso().required(),
  reason: Joi.string().trim().min(1).max(1000).required(),
});
const appointmentQuerySchema = Joi.object({ page: Joi.number().integer().min(1).default(1), limit: Joi.number().integer().min(1).max(100).default(10) });
const updateStatusSchema = Joi.object({ status: Joi.string().valid('Pending', 'Confirmed', 'Completed', 'Cancelled').required() });

module.exports = { appointmentIdParamSchema, bookAppointmentSchema, appointmentQuerySchema, updateStatusSchema };
