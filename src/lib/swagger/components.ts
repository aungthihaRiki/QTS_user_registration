import { OpenAPIV3 } from 'openapi-types';

export const swaggerComponents: OpenAPIV3.ComponentsObject = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  schemas: {
    Contact: {
      type: "object",
      properties: {
        id: { type: "string" },
        firstName: { type: "string" },
        lastName: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
      },
      required: ["id", "firstName", "lastName", "phone", "email"],
    },
    ContactInput: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
      },
      required: ["firstName", "lastName", "phone", "email"],
    },
    RegisterUserInput: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        password: { type: "string" },
      },
      required: ["name", "email", "phone", "password"],
    },
    LoginUserInput: {
      type: "object",
      properties: {
        phone: { type: "string" },
        password: { type: "string" },
      },
      required: ["phone", "password"],
    },
  },
};
