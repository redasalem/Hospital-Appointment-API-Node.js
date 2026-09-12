const Joi = require('joi');

const timeFormatRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Sub-schema for single working hours entry
 */
const workingHourSchema = Joi.object({
  day: Joi.string()
    .valid(
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday'
    )
    .required()
    .messages({
      'any.only': 'Day must be a valid weekday (e.g. Monday)',
      'any.required': 'Day of the week is required',
    }),
  startTime: Joi.string()
    .pattern(timeFormatRegex)
    .required()
    .messages({
      'string.pattern.base': 'startTime must be in HH:mm format (e.g. 09:00)',
      'any.required': 'startTime is required',
    }),
  endTime: Joi.string()
    .pattern(timeFormatRegex)
    .required()
    .messages({
      'string.pattern.base': 'endTime must be in HH:mm format (e.g. 17:00)',
      'any.required': 'endTime is required',
    }),
}).custom((value, helpers) => {
  if (value.startTime && value.endTime && value.startTime >= value.endTime) {
    return helpers.message({ custom: 'endTime must be later than startTime' });
  }
  return value;
});

/**
 * Validation schema for creating a new doctor (POST /api/doctors)
 */
const createDoctorSchema = Joi.object({
  user: Joi.string().pattern(mongoIdRegex).required().messages({
    'any.required': 'A linked Doctor user is required',
  }),
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Doctor name cannot be empty',
    'string.min': 'Doctor name must be at least 2 characters long',
    'string.max': 'Doctor name cannot exceed 100 characters',
    'any.required': 'Doctor name is required',
  }),
  specialization: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Specialization cannot be empty',
    'any.required': 'Specialization is required',
  }),
  description: Joi.string().trim().max(1000).allow('').optional().messages({
    'string.max': 'Description cannot exceed 1000 characters',
  }),
  phone: Joi.string().trim().min(7).max(20).required().messages({
    'string.empty': 'Phone number cannot be empty',
    'any.required': 'Phone number is required',
  }),
  workingHours: Joi.array().items(workingHourSchema).default([]).optional(),
  isActive: Joi.boolean().default(true),
});

/**
 * Validation schema for updating a doctor (PATCH /api/doctors/:id)
 */
const updateDoctorSchema = Joi.object({
  user: Joi.string().pattern(mongoIdRegex).optional(),
  name: Joi.string().trim().min(2).max(100).optional().messages({
    'string.empty': 'Doctor name cannot be empty',
    'string.min': 'Doctor name must be at least 2 characters long',
    'string.max': 'Doctor name cannot exceed 100 characters',
  }),
  specialization: Joi.string().trim().min(2).max(100).optional().messages({
    'string.empty': 'Specialization cannot be empty',
  }),
  description: Joi.string().trim().max(1000).allow('').optional(),
  phone: Joi.string().trim().min(7).max(20).optional().messages({
    'string.empty': 'Phone number cannot be empty',
  }),
  workingHours: Joi.array().items(workingHourSchema).optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

/**
 * Validation schema for URL parameter :id
 */
const doctorIdParamSchema = Joi.object({
  id: Joi.string().pattern(mongoIdRegex).required().messages({
    'string.pattern.base': 'Invalid Doctor ID format. Must be a 24-character hexadecimal ObjectId',
    'any.required': 'Doctor ID parameter is required',
  }),
});

/**
 * Validation schema for query parameters (GET /api/doctors)
 */
const doctorQuerySchema = Joi.object({
  specialization: Joi.string().trim().optional(),
  search: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  createDoctorSchema,
  updateDoctorSchema,
  doctorIdParamSchema,
  doctorQuerySchema,
};
