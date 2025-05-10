/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_ASSISTANT_ID: process.env.NEXT_PUBLIC_ASSISTANT_ID,
    NEXT_PUBLIC_LANGGRAPH_API_URL: process.env.NEXT_PUBLIC_LANGGRAPH_API_URL,
    NEXT_PUBLIC_LANGSMITH_API_KEY: process.env.NEXT_PUBLIC_LANGSMITH_API_KEY,
    NEXT_PUBLIC_X_ORGANIZATION_ID: process.env.NEXT_PUBLIC_X_ORGANIZATION_ID,
    NEXT_PUBLIC_X_TENANT_ID: process.env.NEXT_PUBLIC_X_TENANT_ID,
    NEXT_PUBLIC_ACCESS_CODE: process.env.NEXT_PUBLIC_ACCESS_CODE,
  },
  devIndicators: false
};

export default nextConfig;
