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
  "/api/auth/passwordRequest": {
    post: {
      summary: "Password Reset Request",
      tags: ["Password Reset"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/PasswordResetInput" },
          },
        },
      },
      responses: {
        200: { description: "Password reset email has been sent." },
        404: { description: "User not found." },
        405: { description: "Methods not allowed" },
        422: { description: "Validation Errors" },
        429: { description: "We already sent you a password reset link.PLease try again in 1 hour." },
        500: { description: "Internal Server error" },        
      },
    },
  },

};
