import "swagger-ui-react/swagger-ui.css";
import SwaggerUI from "swagger-ui-react";

export default function SwaggerPage({ spec }: { spec: any }) {
  return (
    <div className="">
      <SwaggerUI spec={spec} />
    </div>
  );
}

export async function getServerSideProps() {
  const swaggerJSDoc = (await import("swagger-jsdoc")).default;
  const { swaggerOptions } = await import("@/lib/swagger/swagger");

  const spec = swaggerJSDoc(swaggerOptions);

  return {
    props: {
      spec,
    },
  };
}