import { getApiDocs } from '@/lib/swagger';
import ReactSwagger from './react-swagger';

export const metadata = {
  title: 'API Documentation - Clinic System',
  description: 'API Documentation for the Clinic System',
};

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return <ReactSwagger spec={spec} />;
}
