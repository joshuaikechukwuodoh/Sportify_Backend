import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Spotify Backend API",
      version: "1.0.0",
      description: "API documentation for Spotify Backend Service",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    "./app/api/**/route.js",  // This will pick up all your route files
    "!./app/api/docs/route.js"  // Exclude the docs route itself
  ]
});