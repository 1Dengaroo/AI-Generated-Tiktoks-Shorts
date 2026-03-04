import dotenv from "dotenv";
dotenv.config();

import {
  deployFunction,
  deploySite,
  getOrCreateBucket,
} from "@remotion/lambda";
import path from "path";
import type { AwsRegion } from "@remotion/lambda";

const REGION: AwsRegion =
  (process.env.REMOTION_AWS_REGION as AwsRegion) || "us-east-2";

const MEMORY_SIZE = 2048;
const DISK_SIZE = 2048;
const TIMEOUT = 240;

async function main() {
  console.log(`Deploying Remotion Lambda to ${REGION}...\n`);

  // 1. Deploy Lambda function
  console.log("Deploying Lambda function...");
  const { functionName, alreadyExisted } = await deployFunction({
    region: REGION,
    memorySizeInMb: MEMORY_SIZE,
    diskSizeInMb: DISK_SIZE,
    timeoutInSeconds: TIMEOUT,
    createCloudWatchLogGroup: true,
  });

  console.log(
    `  Function: ${functionName} (${alreadyExisted ? "already existed" : "newly created"})`,
  );

  // 2. Get or create bucket for site
  const { bucketName } = await getOrCreateBucket({ region: REGION });
  console.log(`  Bucket: ${bucketName}`);

  // 3. Deploy site (Remotion bundle) to S3
  console.log("\nDeploying site bundle to S3...");
  const { serveUrl } = await deploySite({
    region: REGION,
    bucketName,
    entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
    siteName: "rshorts",
    options: {
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            "@": path.join(process.cwd()),
          },
        },
      }),
    },
  });

  console.log(`  Serve URL: ${serveUrl}`);

  // 4. Print env vars to set
  console.log("\n--- Add these to your .env ---");
  console.log(`REMOTION_AWS_REGION=${REGION}`);
  console.log(`REMOTION_FUNCTION_NAME=${functionName}`);
  console.log(`REMOTION_SERVE_URL=${serveUrl}`);
  console.log("------------------------------\n");
}

main().catch((err) => {
  console.error("Deploy failed:", err);
  process.exit(1);
});
