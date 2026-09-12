/**
 * Generic Joi validation middleware.
 * Validates req.body, req.params, or req.query against a provided Joi schema.
 * 
 * @param {import('joi').ObjectSchema} schema - The Joi schema to validate against
 * @param {'body' | 'params' | 'query'} [source='body'] - Request property to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: details,
      });
    }

    // Replace request payload with sanitized, type-cast value
    req[source] = value;
    next();
  };
};

module.exports = validate;
