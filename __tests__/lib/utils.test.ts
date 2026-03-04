import { getErrorMessage } from "@/lib/utils";

describe("getErrorMessage", () => {
  it("extracts message from Error instance", () => {
    expect(getErrorMessage(new Error("bad request"))).toBe("bad request");
  });

  it("returns fallback for non-Error values", () => {
    expect(getErrorMessage("string error")).toBe("Something went wrong");
    expect(getErrorMessage(null)).toBe("Something went wrong");
    expect(getErrorMessage(undefined)).toBe("Something went wrong");
    expect(getErrorMessage(42)).toBe("Something went wrong");
  });

  it("uses custom fallback when provided", () => {
    expect(getErrorMessage("oops", "Custom fallback")).toBe("Custom fallback");
  });
});
