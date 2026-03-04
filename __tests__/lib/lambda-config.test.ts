import { getLambdaConfig } from "@/lib/render/lambda-config";

describe("getLambdaConfig", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns config when all env vars are set", () => {
    process.env.REMOTION_AWS_REGION = "us-east-2";
    process.env.REMOTION_FUNCTION_NAME = "remotion-render";
    process.env.REMOTION_SERVE_URL = "https://example.com/bundle";

    const config = getLambdaConfig();
    expect(config.region).toBe("us-east-2");
    expect(config.functionName).toBe("remotion-render");
    expect(config.serveUrl).toBe("https://example.com/bundle");
  });

  it("throws when REMOTION_AWS_REGION is missing", () => {
    delete process.env.REMOTION_AWS_REGION;
    process.env.REMOTION_FUNCTION_NAME = "fn";
    process.env.REMOTION_SERVE_URL = "url";

    expect(() => getLambdaConfig()).toThrow("REMOTION_AWS_REGION");
  });

  it("throws when REMOTION_FUNCTION_NAME is missing", () => {
    process.env.REMOTION_AWS_REGION = "us-east-2";
    delete process.env.REMOTION_FUNCTION_NAME;
    process.env.REMOTION_SERVE_URL = "url";

    expect(() => getLambdaConfig()).toThrow("REMOTION_FUNCTION_NAME");
  });

  it("throws when REMOTION_SERVE_URL is missing", () => {
    process.env.REMOTION_AWS_REGION = "us-east-2";
    process.env.REMOTION_FUNCTION_NAME = "fn";
    delete process.env.REMOTION_SERVE_URL;

    expect(() => getLambdaConfig()).toThrow("REMOTION_SERVE_URL");
  });
});
