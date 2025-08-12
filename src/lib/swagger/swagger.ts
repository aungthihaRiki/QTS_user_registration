import { swaggerPaths } from "./paths";
import { swaggerComponents } from "./components";
import { Options } from "swagger-jsdoc";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Next.js Prisma API",
      version: "1.1.1",
    },
    servers: [
      { url: "http://localhost:3000/", description: "Local dev" },
      {
        url: "https://my-swagger-api-page-route.vercel.app/",
        description: "Production",
      },
    ],
    components: swaggerComponents,
    paths: swaggerPaths,
  },
  apis: ["./src/pages/api/**/*.ts"], // API files with Swagger comments
};

// export const swaggerSpec = swaggerJsdoc(swaggerOptions);


