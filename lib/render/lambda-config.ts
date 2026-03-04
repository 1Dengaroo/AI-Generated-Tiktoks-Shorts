import type { AwsRegion } from "@remotion/lambda";

export type LambdaConfig = {
  region: AwsRegion;
  functionName: string;
  serveUrl: string;
};

export function getLambdaConfig(): LambdaConfig {
  const region = process.env.REMOTION_AWS_REGION;
  const functionName = process.env.REMOTION_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_SERVE_URL;

  if (!region) throw new Error("Missing REMOTION_AWS_REGION env var");
  if (!functionName) throw new Error("Missing REMOTION_FUNCTION_NAME env var");
  if (!serveUrl) throw new Error("Missing REMOTION_SERVE_URL env var");

  return {
    region: region as AwsRegion,
    functionName,
    serveUrl,
  };
}
