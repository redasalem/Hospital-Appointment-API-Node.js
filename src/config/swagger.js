const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Loads the standalone OpenAPI YAML spec and serves it via Swagger UI.
 *
 * Why not swagger-jsdoc?
 * swagger-jsdoc scans JS files for @openapi JSDoc annotations and merges
 * them into a definition stub. Our docs/swagger.yaml is a complete,
 * self-contained OpenAPI 3.0 document (paths, components, security schemes),
 * so we load it directly instead.
 */
const setupSwagger = (app) => {
  const swaggerFile = path.join(__dirname, '../../docs/swagger.yaml');
  const fileContents = fs.readFileSync(swaggerFile, 'utf8');
  const swaggerSpec = yaml.parse(fileContents);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
