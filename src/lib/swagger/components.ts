import { OpenAPIV3 } from "openapi-types";

export const swaggerComponents: OpenAPIV3.ComponentsObject = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  schemas: {
    RegisterUserInput: {
      type: "object",
      properties: {
        firstName: { type: "string" },
        lastName: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        password: { type: "string" },
      },
      required: ["email", "phone", "password"],
    },
    LoginUserInput: {
      type: "object",
      properties: {
        phone: { type: "string" },
        password: { type: "string" },
      },
      required: ["phone", "password"],
    },
    PasswordResetInput: {
      type: "object",
      properties: {
        phone: { type: "string" },
      },
      required: ["phone"],
    },
    PasswordResetRequestInput: {
      type: "object",
      properties: {
        phone: { type: "string" },
        passwordResetRequestStatus: { type: "string" },
      },
      required: ["phone", "passwordResetRequestStatus"],
    },
    newPasswordResetInput: {
      type: "object",
      properties: {
        phone: { type: "string" },
        newPassword: { type: "string" },
        token: { type: "string" },
      },
      required: ["phone", "newPassword", "token"],
    },
  },
};
