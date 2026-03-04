import { bundle } from "@remotion/bundler";
import path from "path";

async function main() {
  console.log("Bundling Remotion composition...");

  const bundlePath = await bundle({
    entryPoint: path.join(process.cwd(), "remotion", "index.ts"),
    outDir: path.join(process.cwd(), ".remotion-bundle"),
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
  });

  console.log(`Bundle created at: ${bundlePath}`);
}

main().catch((err) => {
  console.error("Bundle failed:", err);
  process.exit(1);
});
