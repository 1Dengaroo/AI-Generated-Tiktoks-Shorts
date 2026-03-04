import { s3KeyFromUrl } from "@/lib/video/storage";

// s3KeyFromUrl calls getBucket() internally which reads AWS_S3_BUCKET
const BUCKET = "test-bucket";

describe("s3KeyFromUrl", () => {
  beforeAll(() => {
    process.env.AWS_S3_BUCKET = BUCKET;
  });

  it("extracts key from virtual-hosted URL", () => {
    const url = `https://${BUCKET}.s3.us-east-2.amazonaws.com/renders/user1/video.mp4`;
    expect(s3KeyFromUrl(url)).toBe("renders/user1/video.mp4");
  });

  it("extracts key from path-style URL", () => {
    const url = `https://s3.us-east-2.amazonaws.com/${BUCKET}/narrations/audio.mp3`;
    expect(s3KeyFromUrl(url)).toBe("narrations/audio.mp3");
  });

  it("decodes URL-encoded characters", () => {
    const url = `https://${BUCKET}.s3.us-east-2.amazonaws.com/renders/user%201/my%20video.mp4`;
    expect(s3KeyFromUrl(url)).toBe("renders/user 1/my video.mp4");
  });

  it("returns null for non-S3 URL", () => {
    expect(s3KeyFromUrl("https://example.com/file.mp4")).toBeNull();
  });

  it("returns null for invalid URL", () => {
    expect(s3KeyFromUrl("not a url")).toBeNull();
  });

  it("supports explicit bucket parameter", () => {
    const url = "https://other-bucket.s3.us-east-2.amazonaws.com/key/file.mp4";
    expect(s3KeyFromUrl(url, "other-bucket")).toBe("key/file.mp4");
  });

  it("handles presigned URL with query parameters", () => {
    const url = `https://${BUCKET}.s3.us-east-2.amazonaws.com/renders/out.mp4?X-Amz-Signature=abc123&X-Amz-Expires=3600`;
    expect(s3KeyFromUrl(url)).toBe("renders/out.mp4");
  });
});
