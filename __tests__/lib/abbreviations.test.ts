import { expandAbbreviations } from "@/lib/narration/abbreviations";

describe("expandAbbreviations", () => {
  it("expands AITA", () => {
    expect(expandAbbreviations("AITA for doing this?")).toBe(
      "Am I the asshole for doing this?",
    );
  });

  it("expands multiple abbreviations in one string", () => {
    const result = expandAbbreviations("AITA? NTA says my MIL");
    expect(result).toBe(
      "Am I the asshole? Not the asshole says my mother-in-law",
    );
  });

  it("does not expand partial matches", () => {
    expect(expandAbbreviations("WAITING for something")).toBe(
      "WAITING for something",
    );
  });

  it("returns original text when no abbreviations found", () => {
    const text = "Just a normal sentence.";
    expect(expandAbbreviations(text)).toBe(text);
  });
});
