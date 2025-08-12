declare module 'swagger-ui-react' {
  import { FC } from 'react';

  interface SwaggerUIProps {
    spec?: any;
    url?: string;
    docExpansion?: 'none' | 'list' | 'full';
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    displayRequestDuration?: boolean;
    tryItOutEnabled?: boolean;
    supportedSubmitMethods?: string[];
    validatorUrl?: string | null;
    presets?: any[];
    plugins?: any[];
    layout?: string;
  }

  const SwaggerUI: FC<SwaggerUIProps>;
  export default SwaggerUI;
}
