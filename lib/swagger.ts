import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/(Back_End)/api', // Point to your API routes
    definition: {
      openapi: '3.0.0',
      info: { title: 'Next.js API Docs', version: '1.0.0' },
    },
  });
  return spec;
};
