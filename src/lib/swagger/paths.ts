import { OpenAPIV3 } from 'openapi-types';

export const swaggerPaths: OpenAPIV3.PathsObject = {
    "/api/auth/register": {
    post: {
      summary: "Register a new user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterUserInput" },
          },
        },
      },
      responses: {
        201: { description: "User registered successfully" },
        400: { description: "Bad request" },
        409: { description: "User already exists" },
        500: { description: "Server error" },
      },
    },
  },
      "/api/auth/login": {
    post: {
      summary: "Login",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginUserInput" },
          },
        },
      },
      responses: {
        200: { description: "User login successfully" },
        400: { description: "Bad request" },
        401: { description: "Invalid credentials" },
        404: { description: "User not found" },
        500: { description: "Server error" },
      },
    },
  },

};
