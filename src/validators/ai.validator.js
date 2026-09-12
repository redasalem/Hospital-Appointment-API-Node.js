const Joi = require('joi');

const summarizeSymptomsSchema = Joi.object({
  symptoms: Joi.string().trim().min(1).max(2000).required(),
  description: Joi.string().trim().max(2000).allow('').optional(),
});

module.exports = { summarizeSymptomsSchema };
